import assert from 'node:assert/strict';
import test from 'node:test';
import { buildStructuredFallbackAnswer, buildAnswerPlan } from '../src/structuredAnswer.js';

test('builds a logical fallback answer with conclusion, steps, details, and sources', () => {
  const answer = buildStructuredFallbackAnswer('合同怎么签？', [
    {
      id: 'k1',
      title: '合同签署资料',
      content: '合同签署需要营业执照和联系人手机号。',
      tags: ['合同'],
      category: '售前',
      scenarios: ['签合同'],
      concepts: ['营业执照', '联系人'],
      steps: ['准备营业执照', '确认联系人手机号']
    }
  ]);

  assert.match(answer, /结论/);
  assert.match(answer, /处理步骤/);
  assert.match(answer, /补充说明/);
  assert.match(answer, /参考来源/);
  assert.match(answer, /准备营业执照/);
});

test('builds an answer plan from graph and matched knowledge', () => {
  const plan = buildAnswerPlan('合同怎么签？', [
    {
      id: 'k1',
      title: '合同签署资料',
      content: '合同签署需要营业执照和联系人手机号。',
      tags: ['合同'],
      category: '售前',
      scenarios: ['签合同'],
      concepts: ['营业执照', '联系人'],
      steps: ['准备营业执照']
    }
  ]);

  assert.match(plan, /回答结构/);
  assert.match(plan, /必须引用来源/);
  assert.match(plan, /合同签署资料/);
});
