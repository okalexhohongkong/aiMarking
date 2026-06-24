import assert from 'node:assert/strict';
import test from 'node:test';
import { buildKnowledgeGraph, buildGraphContext } from '../src/knowledgeGraph.js';

test('builds concept, category, scenario, and step graph from knowledge items', () => {
  const graph = buildKnowledgeGraph([
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

  assert.ok(graph.nodes.some((node) => node.id === 'knowledge:k1'));
  assert.ok(graph.nodes.some((node) => node.id === 'concept:营业执照'));
  assert.ok(graph.nodes.some((node) => node.id === 'category:售前'));
  assert.ok(graph.edges.some((edge) => edge.from === 'knowledge:k1' && edge.to === 'concept:营业执照' && edge.type === 'mentions'));
  assert.ok(graph.edges.some((edge) => edge.type === 'next_step' && edge.from === 'step:k1:0' && edge.to === 'step:k1:1'));
});

test('builds a compact graph context for matched knowledge', () => {
  const context = buildGraphContext([
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

  assert.match(context, /分类：售前/);
  assert.match(context, /关键概念：营业执照、联系人/);
  assert.match(context, /处理步骤：1\. 准备营业执照/);
});
