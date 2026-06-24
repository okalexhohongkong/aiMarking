import assert from 'node:assert/strict';
import test from 'node:test';
import { getMarketingSystemBlueprint, listMarketingModules } from '../src/aiMarketingSystem.js';

test('describes the seven-layer AI marketing system in order', () => {
  const modules = listMarketingModules();

  assert.equal(modules.length, 7);
  assert.deepEqual(modules.map((module) => module.order), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(modules.map((module) => module.id), [
    'content-capture',
    'content-remix',
    'matrix-publishing',
    'comment-intent',
    'dm-conversation',
    'ai-customer-service',
    'conversion-guidance'
  ]);
});

test('keeps the current customer service system as an active module', () => {
  const serviceModule = listMarketingModules().find((module) => module.id === 'ai-customer-service');

  assert.equal(serviceModule.status, 'active');
  assert.ok(serviceModule.capabilities.includes('多平台客服端口'));
  assert.ok(serviceModule.capabilities.includes('知识图谱推理'));
});

test('blueprint exposes pipeline, summary, and compliance principles', () => {
  const blueprint = getMarketingSystemBlueprint();

  assert.equal(blueprint.name, '黑卫士七维AI营销系统');
  assert.equal(blueprint.summary.total, 7);
  assert.equal(blueprint.pipelineEdges.length, 6);
  assert.ok(blueprint.compliancePrinciples.some((principle) => principle.includes('不复制原文')));
  assert.ok(blueprint.compliancePrinciples.some((principle) => principle.includes('人工确认')));
  assert.ok(blueprint.nextBuildSteps[0].includes('留言分级'));
});
