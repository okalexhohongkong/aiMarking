import assert from 'node:assert/strict';
import test from 'node:test';
import { getChannelPort, listChannelPorts, summarizeChannelPorts } from '../src/channelPorts.js';

test('lists all planned customer service channel ports', () => {
  const ports = listChannelPorts({});
  const names = ports.map((port) => port.name);

  assert.deepEqual(names, [
    '企业微信',
    '微信小程序客服',
    '个人微信',
    '抖音客服',
    '快手客服',
    '小红书客服',
    '视频号客服',
    '淘宝客服',
    '拼多多客服',
    '京东客服',
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
  ]);
});

test('keeps required AI conversation entry ports available', () => {
  const ports = listChannelPorts({});
  const names = new Set(ports.map((port) => port.name));
  const requiredNames = [
    '短信',
    '头条号/今日头条',
    '百度百家号',
    'B站',
    '知乎',
    'LinkedIn',
    'Facebook',
    'WhatsApp',
    'X/Twitter',
    'TikTok',
    '企业微信',
    '抖音客服',
    '个人微信',
    '小红书客服',
    '快手客服',
    '视频号客服',
    '淘宝客服',
    '拼多多客服',
    '京东客服'
  ];

  for (const name of requiredNames) {
    assert.equal(names.has(name), true, `${name} should be listed`);
  }
});

test('marks implemented wecom port as connected when credentials are filled', () => {
  const port = getChannelPort('wecom', {
    WECOM_BOT_ID: 'bot-id',
    WECOM_BOT_SECRET: 'bot-secret'
  });

  assert.equal(port.status, 'connected');
  assert.equal(port.credentialStatus.complete, true);
  assert.deepEqual(port.credentialStatus.required, [
    { key: 'WECOM_BOT_ID', filled: true },
    { key: 'WECOM_BOT_SECRET', filled: true }
  ]);
});

test('keeps reserved ports separate from implemented ports', () => {
  const port = getChannelPort('douyin', {
    DOUYIN_APP_ID: 'douyin-id',
    DOUYIN_APP_SECRET: 'douyin-secret'
  });

  assert.equal(port.implemented, false);
  assert.equal(port.status, 'credentials_ready');
  assert.equal(port.credentialStatus.complete, true);
});

test('marks newly reserved AI entry ports as credentials ready without implementation', () => {
  const port = getChannelPort('whatsapp', {
    WHATSAPP_PHONE_NUMBER_ID: 'phone-id',
    WHATSAPP_BUSINESS_TOKEN: 'business-token'
  });

  assert.equal(port.implemented, false);
  assert.equal(port.status, 'credentials_ready');
  assert.equal(port.credentialStatus.complete, true);
  assert.equal(port.capabilities.includes('AI 对话入口'), true);
});

test('summarizes channel port rollout status without exposing secret values', () => {
  const env = {
    WECOM_BOT_ID: 'bot-id',
    WECOM_BOT_SECRET: 'bot-secret',
    TAOBAO_APP_KEY: 'taobao-key',
    WHATSAPP_BUSINESS_TOKEN: 'whatsapp-secret',
    X_TWITTER_API_SECRET: 'twitter-secret'
  };

  const summary = summarizeChannelPorts(env);
  const ports = listChannelPorts(env);
  const serialized = JSON.stringify(ports);

  assert.equal(summary.total, 20);
  assert.equal(summary.connected, 1);
  assert.equal(summary.reserved, 19);
  assert.equal(summary.needsCredentials, 0);
  assert.equal(serialized.includes('bot-secret'), false);
  assert.equal(serialized.includes('taobao-key'), false);
  assert.equal(serialized.includes('whatsapp-secret'), false);
  assert.equal(serialized.includes('twitter-secret'), false);
});
