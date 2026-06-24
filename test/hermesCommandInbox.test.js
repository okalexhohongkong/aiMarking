import assert from 'node:assert/strict';
import test from 'node:test';
import { buildHermesCommandPayload, submitHermesCommand } from '../src/hermesCommandInbox.js';

test('builds a safe Hermes command payload from text and metadata', () => {
  const payload = buildHermesCommandPayload({
    text: '  把自动私信生成器接入演示页  ',
    sender: ' apple ',
    source: ' feishu ',
    priority: 'high'
  });

  assert.deepEqual(payload, {
    source: 'feishu',
    sender: 'apple',
    priority: 'high',
    direction: 'inbound',
    type: 'task',
    target: 'codex',
    text: '把自动私信生成器接入演示页'
  });
});

test('falls back to safe source, sender, and priority values', () => {
  const payload = buildHermesCommandPayload({
    text: '继续开发',
    sender: '',
    source: '',
    priority: 'urgent'
  });

  assert.equal(payload.source, 'hermes');
  assert.equal(payload.sender, 'apple');
  assert.equal(payload.priority, 'normal');
  assert.equal(payload.direction, 'inbound');
  assert.equal(payload.type, 'task');
  assert.equal(payload.target, 'codex');
});

test('rejects empty or too long Hermes command text', () => {
  assert.throws(() => buildHermesCommandPayload({ text: '' }), /指令内容不能为空/);
  assert.throws(() => buildHermesCommandPayload({ text: 'x'.repeat(3001) }), /指令内容太长/);
});

test('submits Hermes command to the dashboard inbox without executing it', async () => {
  const requests = [];
  const result = await submitHermesCommand({
    baseUrl: 'http://127.0.0.1:8787',
    command: {
      text: '刷新项目进度',
      sender: 'apple',
      priority: 'high'
    },
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return {
        ok: true,
        text: async () => JSON.stringify({ id: 'cmd-1', status: 'new' })
      };
    }
  });

  assert.equal(result.status, 'new');
  assert.equal(requests[0].url, 'http://127.0.0.1:8787/api/hermes/commands');
  assert.equal(requests[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    source: 'hermes',
    sender: 'apple',
    priority: 'high',
    direction: 'inbound',
    type: 'task',
    target: 'codex',
    text: '刷新项目进度'
  });
});

test('builds an outbound Hermes blocker payload for user-facing instructions', () => {
  const payload = buildHermesCommandPayload({
    text: '企业微信接入卡住：缺少 WECOM_BOT_ID，请通过 Hermes 回复。',
    sender: 'codex',
    source: 'codex',
    priority: 'high',
    direction: 'outbound',
    type: 'blocker',
    target: 'apple',
    moduleId: 'platforms',
    taskId: 'platforms-wecom'
  });

  assert.equal(payload.direction, 'outbound');
  assert.equal(payload.type, 'blocker');
  assert.equal(payload.target, 'apple');
  assert.equal(payload.moduleId, 'platforms');
  assert.equal(payload.taskId, 'platforms-wecom');
  assert.match(payload.text, /企业微信接入卡住/);
});
