import assert from 'node:assert/strict';
import test from 'node:test';
import { getCustomerLifecycleBlueprint } from '../src/customerLifecycle.js';

const expectedStages = ['获客', '前置引流', '售前', '售中', '售后', '跟单', '复购'];

test('describes customer lifecycle stages in conversion order', () => {
  const blueprint = getCustomerLifecycleBlueprint();

  assert.deepEqual(
    blueprint.stages.map((stage) => stage.name),
    expectedStages
  );
  assert.deepEqual(
    blueprint.stages.map((stage) => stage.order),
    [1, 2, 3, 4, 5, 6, 7]
  );
});

test('each lifecycle stage has complete compliant operating guidance', () => {
  const { stages } = getCustomerLifecycleBlueprint();

  for (const stage of stages) {
    assert.ok(stage.id);
    assert.ok(stage.goal);
    assert.ok(stage.requiresHumanApproval === true || stage.requiresHumanApproval === false);
    assert.ok(stage.trustActions.length >= 2);
    assert.ok(stage.valueHooks.length >= 2);
    assert.ok(stage.complianceBoundaries.length >= 2);
    assert.ok(stage.channels.length >= 1);
  }
});

test('compliance boundaries emphasize consent, truthfulness, and review', () => {
  const { stages, compliancePrinciples } = getCustomerLifecycleBlueprint();
  const boundaryText = stages
    .flatMap((stage) => stage.complianceBoundaries)
    .concat(compliancePrinciples)
    .join('\n');

  assert.match(boundaryText, /同意|许可|授权/);
  assert.match(boundaryText, /真实|准确|不夸大/);
  assert.match(boundaryText, /人工确认|人工审核/);
});

test('repurchase stage supports long-term relationship and repeat purchase', () => {
  const repurchase = getCustomerLifecycleBlueprint().stages.find((stage) => stage.name === '复购');

  assert.ok(repurchase);
  assert.equal(repurchase.id, 'repurchase');
  assert.match(repurchase.goal, /复购|转介绍/);
  assert.ok(repurchase.valueHooks.some((hook) => /老客户|复购|续费/.test(hook)));
  assert.ok(repurchase.channels.includes('企业微信'));
  assert.equal(repurchase.requiresHumanApproval, true);
});

test('blueprint avoids high-risk coercive or deceptive wording', () => {
  const blueprintText = JSON.stringify(getCustomerLifecycleBlueprint());
  const riskyWords = ['欺骗', '诱导', '操控', '洗脑', '套路', '割韭菜'];

  for (const word of riskyWords) {
    assert.doesNotMatch(blueprintText, new RegExp(word));
  }
});
