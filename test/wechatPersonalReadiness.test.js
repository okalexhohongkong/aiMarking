import assert from 'node:assert/strict';
import test from 'node:test';
import { buildWechatPersonalReadiness } from '../src/wechatPersonalReadiness.js';

test('reports missing personal wechat launch requirements in Chinese', () => {
  const readiness = buildWechatPersonalReadiness({ env: {}, host: '127.0.0.1', port: 8787 });

  assert.equal(readiness.ready, false);
  assert.equal(readiness.status, 'blocked_by_credentials');
  assert.equal(readiness.percentText, '40.0%');
  assert.deepEqual(readiness.missingRequired, ['EASYCLAW_BASE_URL', 'EASYCLAW_ACCESS_TOKEN', 'OPENAI_API_KEY']);
  assert.match(readiness.launch.title, /个人微信/);
  assert.match(readiness.groupTest.triggerText, /客户微信/);
});

test('marks personal wechat ready without exposing credential values', () => {
  const readiness = buildWechatPersonalReadiness({
    env: {
      EASYCLAW_BASE_URL: 'http://127.0.0.1:10027',
      EASYCLAW_ACCESS_TOKEN: 'easyclaw-secret',
      OPENAI_API_KEY: 'openai-secret'
    }
  });
  const serialized = JSON.stringify(readiness);

  assert.equal(readiness.ready, true);
  assert.equal(readiness.status, 'ready_for_local_bridge');
  assert.equal(readiness.percentText, '100.0%');
  assert.match(readiness.launch.nextCommand, /127.0.0.1:10027/);
  assert.equal(serialized.includes('easyclaw-secret'), false);
  assert.equal(serialized.includes('openai-secret'), false);
});
