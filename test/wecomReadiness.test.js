import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWecomReadiness } from '../src/wecomReadiness.js';

test('reports missing wecom launch requirements in Chinese', () => {
  const readiness = buildWecomReadiness({ env: {}, host: '127.0.0.1', port: 8787 });

  assert.equal(readiness.ready, false);
  assert.equal(readiness.status, 'blocked_by_credentials');
  assert.equal(readiness.percentText, '25.0%');
  assert.deepEqual(readiness.missingRequired, ['WECOM_BOT_ID', 'WECOM_BOT_SECRET', 'OPENAI_API_KEY']);
  assert.match(readiness.launch.title, /暂不能启动/);
  assert.match(readiness.groupTest.triggerText, /@智能客服/);
});

test('marks wecom ready without exposing credential values', () => {
  const readiness = buildWecomReadiness({
    env: {
      WECOM_BOT_ID: 'bot-id',
      WECOM_BOT_SECRET: 'secret-value',
      OPENAI_API_KEY: 'openai-secret',
      BOT_MENTION_NAME: '黑卫士'
    }
  });
  const serialized = JSON.stringify(readiness);

  assert.equal(readiness.ready, true);
  assert.equal(readiness.status, 'ready_for_launch');
  assert.equal(readiness.percentText, '100.0%');
  assert.match(readiness.launch.nextCommand, /npm start/);
  assert.match(readiness.groupTest.triggerText, /@黑卫士/);
  assert.equal(serialized.includes('secret-value'), false);
  assert.equal(serialized.includes('openai-secret'), false);
  assert.equal(serialized.includes('bot-id'), false);
});
