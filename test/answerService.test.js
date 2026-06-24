import assert from 'node:assert/strict';
import test from 'node:test';
import { AnswerService } from '../src/answerService.js';

test('answers with retrieved knowledge context and records a log', async () => {
  const logs = [];
  const service = new AnswerService({
    store: fakeStore({
      knowledgeItems: [
        {
          id: 'kb1',
          title: '合同签署',
          content: '合同签署需要营业执照和联系人。',
          tags: ['合同'],
          category: '售前',
          scenarios: ['签合同'],
          concepts: ['营业执照'],
          steps: ['准备营业执照']
        }
      ],
      logs
    }),
    llmClient: {
      answer: async (question, context) => {
        assert.equal(question, '合同怎么签？');
        assert.match(context.knowledgeContext, /合同签署需要营业执照/);
        assert.match(context.graphContext, /关键概念：营业执照/);
        assert.match(context.answerPlan, /回答结构/);
        return '合同签署需要营业执照和联系人。';
      }
    }
  });

  const result = await service.answer('合同怎么签？', { source: 'dashboard' });

  assert.equal(result.answer, '合同签署需要营业执照和联系人。');
  assert.equal(result.matches[0].id, 'kb1');
  assert.equal(logs.length, 1);
  assert.equal(logs[0].matchedKnowledgeIds[0], 'kb1');
});

test('falls back to local knowledge when LLM fails', async () => {
  const service = new AnswerService({
    store: fakeStore({
      knowledgeItems: [
        {
          id: 'kb1',
          title: '售后电话',
          content: '售后电话是 400-000-000。',
          tags: ['售后'],
          steps: ['确认客户问题', '提供售后电话']
        }
      ],
      logs: []
    }),
    llmClient: {
      answer: async () => {
        throw new Error('network failed');
      }
    }
  });

  const result = await service.answer('售后电话是多少？', { source: 'wecom' });

  assert.equal(result.usedFallback, true);
  assert.match(result.answer, /结论/);
  assert.match(result.answer, /售后电话是 400-000-000/);
});

function fakeStore({ knowledgeItems, logs }) {
  return {
    listKnowledgeItems: async () => knowledgeItems,
    createConversationLog: async (log) => {
      logs.push(log);
      return { id: 'log1', ...log };
    }
  };
}
