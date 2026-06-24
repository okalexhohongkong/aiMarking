import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultGrowthData, defaultKnowledgeItems } from '../src/seedContent.js';

test('provides a usable first batch of structured knowledge items', () => {
  const items = defaultKnowledgeItems();
  const titles = items.map((item) => item.title);

  assert.ok(items.length >= 10);
  assert.ok(titles.includes('客户首次咨询接待流程'));
  assert.ok(titles.includes('私域资料领取引导'));
  assert.ok(titles.includes('电商平台客服合规边界'));
  assert.ok(titles.includes('儿童过敏护理私信承接知识库'));
  assert.ok(items.every((item) => item.category && item.scenarios.length && item.steps.length));
});

test('provides growth scripts, materials, and rules for common lead scenarios', () => {
  const data = defaultGrowthData();
  const materialNames = data.materials.map((item) => item.name);
  const ruleNames = data.rules.map((item) => item.name);
  const scenes = data.scripts.map((item) => item.scene);

  assert.ok(data.scripts.length >= 6);
  assert.ok(materialNames.includes('新客户入门资料包'));
  assert.ok(materialNames.includes('报价前需求确认表'));
  assert.ok(ruleNames.includes('合作意向'));
  assert.ok(scenes.includes('售后安抚'));
  assert.deepEqual(data.leads, []);
});
