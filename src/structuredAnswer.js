import { buildGraphContext } from './knowledgeGraph.js';

export function buildStructuredFallbackAnswer(question, matches) {
  if (!matches.length) {
    return [
      '结论：我暂时没有在知识库里找到可靠答案。',
      '',
      '处理步骤：',
      '1. 请转人工确认，或补充更多问题背景。',
      '',
      '补充说明：为了避免误导，我不会在没有资料依据时编造答案。',
      '',
      '参考来源：暂无命中知识。'
    ].join('\n');
  }

  const top = matches[0];
  const steps = top.steps?.length ? top.steps : splitContentIntoSteps(top.content);

  return [
    `结论：根据知识库「${top.title}」，${firstSentence(top.content)}`,
    '',
    '处理步骤：',
    ...steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    `补充说明：${top.content}`,
    '',
    `参考来源：${matches.map((item) => `「${item.title}」`).join('、')}`
  ].join('\n');
}

export function buildAnswerPlan(question, matches) {
  return [
    `用户问题：${question}`,
    '',
    '回答结构：',
    '1. 先给明确结论。',
    '2. 再给有顺序的处理步骤。',
    '3. 然后补充注意事项、条件或例外。',
    '4. 最后列出参考来源。',
    '',
    '必须引用来源：回答必须基于命中的知识条目和知识图谱，不确定就说明需要人工确认。',
    '',
    '命中知识与图谱：',
    buildGraphContext(matches)
  ].join('\n');
}

function firstSentence(content) {
  const normalized = String(content || '').trim();
  const match = normalized.match(/^(.+?[。！？!?])/);
  return match ? match[1] : normalized;
}

function splitContentIntoSteps(content) {
  const normalized = String(content || '').trim();
  if (!normalized) {
    return ['根据知识库资料处理。'];
  }

  return normalized
    .split(/[。；;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 5);
}
