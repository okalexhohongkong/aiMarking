import assert from 'node:assert/strict';
import test from 'node:test';
import { readAdminConfig, readConfig } from '../src/config.js';

test('reads optional private deployment websocket url', () => {
  const config = readConfig({
    WECOM_BOT_ID: 'bot-id',
    WECOM_BOT_SECRET: 'bot-secret',
    WECOM_WS_URL: 'wss://example.test',
    OPENAI_API_KEY: 'api-key'
  });

  assert.equal(config.wecom.wsUrl, 'wss://example.test');
});

test('trims the OpenAI-compatible base url', () => {
  const config = readConfig({
    WECOM_BOT_ID: 'bot-id',
    WECOM_BOT_SECRET: 'bot-secret',
    OPENAI_API_KEY: 'api-key',
    OPENAI_BASE_URL: 'http://127.0.0.1:3688/v1/'
  });

  assert.equal(config.knowledge.baseUrl, 'http://127.0.0.1:3688/v1');
});

test('reads admin config without requiring production credentials', () => {
  const config = readAdminConfig({
    ADMIN_PORT: '9999',
    OPENAI_BASE_URL: 'http://127.0.0.1:3688/v1/'
  });

  assert.equal(config.admin.port, 9999);
  assert.equal(config.knowledge.apiKey, undefined);
  assert.equal(config.knowledge.baseUrl, 'http://127.0.0.1:3688/v1');
});
