import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOrchestrationPlan } from '../src/orchestrationPlan.js';

test('splits the project into four parallel workstreams with merge gates', () => {
  const plan = buildOrchestrationPlan();

  assert.equal(plan.name, '黑卫士七维AI营销系统并行任务调度');
  assert.equal(plan.workstreams.length, 4);
  assert.deepEqual(plan.workstreams.map((item) => item.id), ['platforms', 'knowledge-private-message', 'growth-conversion', 'hermes-merge']);
  assert.ok(plan.workstreams.every((item) => item.mergeGate && item.nextStep && item.countdownText.endsWith('小时')));
  assert.ok(plan.summary.totalTasks >= 12);
  assert.ok(plan.summary.parallelSlots >= 4);
});

test('keeps all planned platform ports visible in the platform workstream', () => {
  const plan = buildOrchestrationPlan();
  const platforms = plan.workstreams.find((item) => item.id === 'platforms');
  const taskModules = new Set(platforms.childTasks.map((item) => item.module));
  const requiredModules = [
    '企业微信',
    '抖音',
    '个人微信',
    '微信小程序客服',
    '快手',
    '小红书',
    '视频号',
    '淘宝',
    '拼多多',
    '京东',
    '短信',
    '头条号/今日头条',
    '百度百家号',
    'B站',
    '知乎',
    'LinkedIn',
    'Facebook',
    'WhatsApp',
    'X/Twitter',
    'TikTok'
  ];

  for (const module of requiredModules) {
    assert.equal(taskModules.has(module), true, `${module} should be in the platform task pool`);
  }
});

test('marks slow workstreams for re-splitting and creates child tasks', () => {
  const plan = buildOrchestrationPlan({
    workstreamOverrides: {
      platforms: { remainingHours: 18, status: 'active' },
      'knowledge-private-message': { remainingHours: 5, status: 'active' }
    }
  });

  const platforms = plan.workstreams.find((item) => item.id === 'platforms');
  assert.equal(platforms.needsResplit, true);
  assert.ok(platforms.childTasks.length >= 3);
  assert.ok(platforms.childTasks.some((task) => task.id.includes('wecom')));
  assert.ok(platforms.childTasks.every((task) => task.ownerThread && task.mergeCriteria));

  const knowledge = plan.workstreams.find((item) => item.id === 'knowledge-private-message');
  assert.equal(knowledge.needsResplit, false);
});

test('builds Hermes instructions for blockers and user commands without leaking secrets', () => {
  const plan = buildOrchestrationPlan({
    blockers: [
      {
        id: 'wecom-credentials',
        moduleId: 'platforms',
        title: '企业微信凭证缺失',
        missing: ['WECOM_BOT_ID', 'WECOM_BOT_SECRET'],
        nextStep: '请提供企业微信机器人凭证'
      }
    ]
  });

  assert.equal(plan.hermes.directionPolicy.inbound, '用户通过 Hermes 下发任务，先进入收件箱，人工接受后执行。');
  assert.equal(plan.hermes.directionPolicy.outbound, '系统遇到阻塞或需要用户资料时，通过 Hermes 回传中文指令。');
  assert.ok(plan.hermes.outboundTemplates.some((item) => item.type === 'blocker'));

  const serialized = JSON.stringify(plan);
  assert.equal(serialized.includes('secret-value'), false);
  assert.match(serialized, /企业微信凭证缺失/);
  assert.match(serialized, /WECOM_BOT_ID/);
});
