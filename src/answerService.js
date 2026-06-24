import { buildKnowledgeContext, retrieveKnowledge } from './retriever.js';
import { buildGraphContext } from './knowledgeGraph.js';
import { buildAnswerPlan, buildStructuredFallbackAnswer } from './structuredAnswer.js';

export class AnswerService {
  constructor({ store, llmClient, maxMatches = 5 }) {
    this.store = store;
    this.llmClient = llmClient;
    this.maxMatches = maxMatches;
  }

  async answer(question, context = {}) {
    const knowledgeItems = await this.store.listKnowledgeItems();
    const matches = retrieveKnowledge(question, knowledgeItems, { limit: this.maxMatches });
    const knowledgeContext = buildKnowledgeContext(matches);
    const graphContext = buildGraphContext(matches);
    const answerPlan = buildAnswerPlan(question, matches);

    let answer;
    let usedFallback = false;

    try {
      answer = await this.llmClient.answer(question, {
        ...context,
        knowledgeContext,
        graphContext,
        answerPlan,
        matchedKnowledge: matches
      });
    } catch {
      usedFallback = true;
      answer = buildStructuredFallbackAnswer(question, matches);
    }

    await this.store.createConversationLog({
      question,
      answer,
      source: context.source,
      sender: context.sender,
      roomId: context.roomId,
      matchedKnowledgeIds: matches.map((item) => item.id),
      usedFallback
    });

    return {
      answer,
      matches,
      usedFallback,
      graphContext,
      answerPlan
    };
  }
}
