import assert from 'node:assert/strict';
import test from 'node:test';
import { getEngagementPlaybooks } from '../src/engagementPlaybooks.js';

const expectedScenarioOrder = [
  'comment-one-time-private-message',
  'replied-repeat-private-dialogue',
  'platform-private-dialogue-without-friend',
  'private-domain-handoff',
  'owned-account-comment-replies',
  'negative-comment-handling'
];

test('orders engagement playbooks from first contact to comment risk handling', () => {
  const blueprint = getEngagementPlaybooks();

  assert.deepEqual(
    blueprint.playbooks.map((playbook) => playbook.id),
    expectedScenarioOrder
  );
  assert.deepEqual(blueprint.summary.scenarioOrder, expectedScenarioOrder);
});

test('one-time private message after comment has every required trust and conversion element', () => {
  const oneTimeMessage = getEngagementPlaybooks().playbooks[0];

  assert.equal(oneTimeMessage.id, 'comment-one-time-private-message');
  assert.equal(oneTimeMessage.contactPolicy.maxProactivePrivateMessages, 1);

  const elementIds = oneTimeMessage.messageElements.map((element) => element.id);

  assert.deepEqual(elementIds, [
    'identity',
    'intent',
    'contact-reason',
    'interaction-source',
    'value-offer',
    'safety-verification',
    'reply-guidance'
  ]);

  const elementText = oneTimeMessage.messageElements
    .map((element) => `${element.label}${element.guidance}${element.example}`)
    .join('\n');

  assert.match(elementText, /身份|我是/);
  assert.match(elementText, /来意|想/);
  assert.match(elementText, /为什么找你|因为你/);
  assert.match(elementText, /留言|互动|来源/);
  assert.match(elementText, /解决方案|资料|优惠/);
  assert.match(elementText, /官网|认证|不是诈骗|企业主体/);
  assert.match(elementText, /回复|关键词|继续聊/);
});

test('playbooks cover repeat private chat, no-friend platform chat, group handoff, and broad comment replies', () => {
  const { playbooks } = getEngagementPlaybooks();
  const byId = new Map(playbooks.map((playbook) => [playbook.id, playbook]));

  assert.equal(byId.get('replied-repeat-private-dialogue').contactPolicy.canRepeatAfterUserReply, true);
  assert.equal(byId.get('platform-private-dialogue-without-friend').contactPolicy.requiresFriendship, false);

  const handoffTargets = byId.get('private-domain-handoff').handoffTargets.map((target) => target.name);
  assert.deepEqual(handoffTargets, ['企业微信群', '个人微信群', '抖音群', '小红书群']);

  const publicReply = byId.get('owned-account-comment-replies');
  assert.equal(publicReply.scope, '自有账号评论区');
  assert.ok(publicReply.actions.some((action) => /公开回复/.test(action)));
});

test('negative comment handling stays compliant without risky suppression tactics', () => {
  const negativeComment = getEngagementPlaybooks().playbooks.find((playbook) => playbook.id === 'negative-comment-handling');
  const text = JSON.stringify(negativeComment);

  assert.match(text, /合规澄清/);
  assert.match(text, /安抚/);
  assert.match(text, /事实说明/);
  assert.match(text, /优质内容承接/);

  const riskyWords = ['刷屏', '压制', '水军', '欺骗', '虚假评论', '骚扰'];
  for (const word of riskyWords) {
    assert.doesNotMatch(text, new RegExp(word));
  }
});

test('compliance rules emphasize consent, truthfulness, frequency control, and human review', () => {
  const { complianceRules } = getEngagementPlaybooks();
  const ruleText = complianceRules.map((rule) => `${rule.name}${rule.guidance}`).join('\n');

  assert.match(ruleText, /同意|主动回复|用户授权/);
  assert.match(ruleText, /真实|准确/);
  assert.match(ruleText, /频控|间隔|退出/);
  assert.match(ruleText, /人工确认|人工复核/);
});
