import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProjectProgress, formatProgressPercent } from '../src/projectProgress.js';

test('formats progress percentage with one decimal place', () => {
  assert.equal(formatProgressPercent(99.94), '99.9%');
  assert.equal(formatProgressPercent(12), '12.0%');
  assert.equal(formatProgressPercent(100.4), '100.0%');
  assert.equal(formatProgressPercent(-1), '0.0%');
});

test('builds countdown progress for all dashboard sections', () => {
  const progress = buildProjectProgress({
    now: new Date('2026-06-23T04:00:00.000Z'),
    env: {
      WECOM_BOT_ID: 'bot-id',
      WECOM_BOT_SECRET: 'bot-secret'
    }
  });

  const ids = progress.modules.map((module) => module.id);
  assert.deepEqual(ids, [
    'appearance',
    'status',
    'knowledge',
    'qa',
    'channels',
    'simulator',
    'marketing',
    'private-message',
    'lifecycle',
    'playbooks',
    'hermes',
    'growth',
    'leads'
  ]);

  assert.ok(progress.modules.some((module) => module.title === '黑卫士七维AI营销系统'));
  assert.ok(progress.modules.some((module) => module.title === '自动私信生成器'));
  assert.ok(progress.modules.some((module) => module.title === '客户生命周期'));
  assert.ok(progress.modules.some((module) => module.title === '私信/评论转化剧本'));
  assert.ok(progress.modules.some((module) => module.title === 'Hermes 指令收件箱'));

  const channels = progress.modules.find((module) => module.id === 'channels');
  assert.equal(channels.percentText.endsWith('%'), true);
  assert.equal(Number.isFinite(channels.remainingHours), true);
  assert.equal(channels.tone, 'normal');
  assert.equal(channels.colorLabel, '蓝色正常');
});

test('marks blocked and ahead modules with explicit color labels', () => {
  const progress = buildProjectProgress({
    now: new Date('2026-06-23T04:00:00.000Z'),
    env: {}
  });

  const channels = progress.modules.find((module) => module.id === 'channels');
  const localStatus = progress.modules.find((module) => module.id === 'status');

  assert.equal(channels.tone, 'paused');
  assert.equal(channels.colorLabel, '红色暂停');
  assert.equal(localStatus.tone, 'ahead');
  assert.equal(localStatus.colorLabel, '绿色超前');
});
