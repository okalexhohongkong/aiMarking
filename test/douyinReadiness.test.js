import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDouyinReadiness } from '../src/douyinReadiness.js';

test('reports missing douyin launch requirements in Chinese', () => {
  const readiness = buildDouyinReadiness({ env: {}, host: '127.0.0.1', port: 8787 });

  assert.equal(readiness.ready, false);
  assert.equal(readiness.status, 'blocked_by_credentials');
  assert.equal(readiness.percentText, '40.0%');
  assert.deepEqual(readiness.missingRequired, ['DOUYIN_APP_ID', 'DOUYIN_APP_SECRET', 'OPENAI_API_KEY']);
  assert.match(readiness.launch.title, /暂不能接入/);
  assert.match(readiness.groupTest.triggerText, /想了解资料和优惠/);
});

test('marks douyin ready without exposing credential values', () => {
  const readiness = buildDouyinReadiness({
    env: {
      DOUYIN_APP_ID: 'douyin-id',
      DOUYIN_APP_SECRET: 'douyin-secret',
      OPENAI_API_KEY: 'openai-secret'
    }
  });
  const serialized = JSON.stringify(readiness);

  assert.equal(readiness.ready, true);
  assert.equal(readiness.status, 'ready_for_callback');
  assert.equal(readiness.percentText, '100.0%');
  assert.match(readiness.launch.title, /抖音客服/);
  assert.equal(serialized.includes('douyin-id'), false);
  assert.equal(serialized.includes('douyin-secret'), false);
  assert.equal(serialized.includes('openai-secret'), false);
});
