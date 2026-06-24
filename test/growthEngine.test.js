import assert from 'node:assert/strict';
import test from 'node:test';
import { generateGrowthReply, scoreLead } from '../src/growthEngine.js';

test('scores a high intent lead from buying signals and repeated interaction', () => {
  const result = scoreLead({
    message: '多少钱？有没有案例？我想了解怎么合作',
    platform: '企业微信',
    interactionCount: 3
  });

  assert.equal(result.level, '高意向');
  assert.ok(result.score >= 70);
  assert.ok(result.signals.includes('价格咨询'));
  assert.ok(result.signals.includes('合作意向'));
});

test('generates a compliant private-domain reply with value hook and CTA', () => {
  const result = generateGrowthReply({
    message: '这个怎么选？',
    platform: '企业微信',
    customerStage: '陌生',
    goal: '加企微',
    rules: [
      {
        id: 'r1',
        name: '选型咨询',
        keywords: ['怎么选'],
        enabled: true,
        scene: '选型'
      }
    ],
    scripts: [
      {
        id: 's1',
        scene: '选型',
        customerStage: '陌生',
        painPoint: '选择困难',
        tone: '顾问',
        goal: '加企微',
        template: '你这个情况先别急着定，我可以给你一份{material}，你看完会清楚很多。'
      }
    ],
    materials: [
      {
        id: 'm1',
        name: '选型避坑清单',
        type: '资料',
        description: '帮客户判断型号和场景。',
        cta: '回复“资料”领取'
      }
    ]
  });

  assert.match(result.reply, /选型避坑清单/);
  assert.match(result.reply, /回复“资料”领取/);
  assert.equal(result.requiresHumanApproval, true);
  assert.equal(result.matchedRule.id, 'r1');
});

test('blocks risky direct off-platform guidance on ecommerce platforms', () => {
  const result = generateGrowthReply({
    message: '淘宝上怎么买？',
    platform: '淘宝',
    customerStage: '陌生',
    goal: '加个人微信',
    rules: [],
    scripts: [],
    materials: []
  });

  assert.equal(result.allowed, false);
  assert.match(result.reason, /平台合规/);
});

test('allows ecommerce replies when the goal stays inside the platform', () => {
  const result = generateGrowthReply({
    message: '淘宝上多少钱？有没有案例？',
    platform: '淘宝',
    customerStage: '陌生',
    goal: '平台内咨询',
    interactionCount: 2,
    rules: [],
    scripts: [],
    materials: [
      {
        id: 'm1',
        name: '客户案例集',
        type: '案例',
        cta: '你可以在当前客服窗口继续咨询，我发你平台内可查看的说明。'
      }
    ]
  });

  assert.equal(result.allowed, true);
  assert.match(result.reply, /当前客服窗口/);
  assert.equal(result.requiresHumanApproval, true);
});

test('ignores disabled rules and falls back to default script', () => {
  const result = generateGrowthReply({
    message: '这个怎么选？',
    platform: '抖音',
    customerStage: '陌生',
    goal: '领资料',
    rules: [
      {
        id: 'disabled-rule',
        name: '禁用选型',
        keywords: ['怎么选'],
        enabled: false,
        scene: '选型'
      }
    ],
    scripts: [],
    materials: []
  });

  assert.equal(result.allowed, true);
  assert.equal(result.matchedRule, null);
  assert.match(result.reply, /资料清单/);
  assert.match(result.reply, /回复“资料”/);
});

test('scores low intent leads without buying signals', () => {
  const result = scoreLead({
    message: '你好',
    platform: '抖音',
    interactionCount: 1
  });

  assert.equal(result.level, '低意向');
  assert.deepEqual(result.signals, []);
});

test('matches growth material to cooperation and case intent before falling back', () => {
  const result = generateGrowthReply({
    message: '想合作，多少钱？有没有案例？',
    platform: '企业微信',
    customerStage: '高意向',
    goal: '预约沟通',
    interactionCount: 4,
    rules: [
      {
        id: 'r1',
        name: '合作意向',
        keywords: ['合作'],
        enabled: true,
        scene: '合作'
      }
    ],
    scripts: [
      {
        id: 's1',
        scene: '合作',
        customerStage: '高意向',
        goal: '预约沟通',
        template: '我可以先发你{material}，再安排人工接一下。'
      }
    ],
    materials: [
      {
        id: 'm1',
        name: '售后处理信息清单',
        type: '清单',
        description: '用于售后问题'
      },
      {
        id: 'm2',
        name: '客户案例集',
        type: '案例',
        description: '展示合作案例',
        cta: '回复“案例”领取。'
      },
      {
        id: 'm3',
        name: '报价前需求确认表',
        type: '表格',
        description: '用于确认报价和合作需求'
      }
    ]
  });

  assert.match(result.reply, /客户案例集|报价前需求确认表/);
  assert.doesNotMatch(result.reply, /售后处理信息清单/);
});
