import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIntegrationRoadmap } from '../src/integrationRoadmap.js';

test('orders integrations by requested priority', () => {
  const roadmap = buildIntegrationRoadmap({ env: {} });
  assert.deepEqual(
    roadmap.steps.map((step) => step.id),
    [
      'wecom',
      'douyin',
      'wechat-personal',
      'xiaohongshu',
      'kuaishou',
      'wechat-channels',
      'taobao',
      'pinduoduo',
      'jd',
      'sms',
      'toutiao',
      'baijiahao',
      'bilibili',
      'zhihu',
      'linkedin',
      'facebook',
      'whatsapp',
      'x-twitter',
      'tiktok'
    ]
  );
});

test('includes every required AI conversation entry in the roadmap', () => {
  const roadmap = buildIntegrationRoadmap({ env: {} });
  const names = new Set(roadmap.steps.map((step) => step.name));
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
    '抖音私信/客服',
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

test('marks wecom as blocked until credentials are provided', () => {
  const roadmap = buildIntegrationRoadmap({ env: {} });
  const wecom = roadmap.steps[0];

  assert.equal(wecom.status, 'blocked');
  assert.equal(wecom.percentText, '45.0%');
  assert.deepEqual(wecom.missingRequired, ['WECOM_BOT_ID', 'WECOM_BOT_SECRET']);
  assert.equal(JSON.stringify(roadmap).includes('secret-value'), false);
});

test('moves douyin into the next slot after wecom credentials are present', () => {
  const roadmap = buildIntegrationRoadmap({
    env: {
      WECOM_BOT_ID: 'bot-id',
      WECOM_BOT_SECRET: 'secret-value'
    }
  });

  const wecom = roadmap.steps.find((step) => step.id === 'wecom');
  const douyin = roadmap.steps.find((step) => step.id === 'douyin');

  assert.equal(wecom.status, 'ready');
  assert.equal(wecom.percentText, '75.0%');
  assert.equal(douyin.status, 'active');
  assert.deepEqual(douyin.missingRequired, ['DOUYIN_APP_ID', 'DOUYIN_APP_SECRET']);
});

test('marks reserved global channels ready when metadata credentials are present', () => {
  const roadmap = buildIntegrationRoadmap({
    env: {
      WHATSAPP_PHONE_NUMBER_ID: 'phone-id',
      WHATSAPP_BUSINESS_TOKEN: 'whatsapp-secret',
      LINKEDIN_CLIENT_ID: 'linkedin-id',
      LINKEDIN_CLIENT_SECRET: 'linkedin-secret'
    }
  });

  const whatsapp = roadmap.steps.find((step) => step.id === 'whatsapp');
  const linkedin = roadmap.steps.find((step) => step.id === 'linkedin');
  const serialized = JSON.stringify(roadmap);

  assert.equal(whatsapp.percentText, '28.0%');
  assert.deepEqual(whatsapp.missingRequired, []);
  assert.equal(linkedin.percentText, '28.0%');
  assert.deepEqual(linkedin.missingRequired, []);
  assert.equal(serialized.includes('whatsapp-secret'), false);
  assert.equal(serialized.includes('linkedin-secret'), false);
});

test('summarizes countdown hours and status counts', () => {
  const roadmap = buildIntegrationRoadmap({ env: {} });
  assert.ok(roadmap.summary.remainingHours > 0);
  assert.equal(roadmap.summary.blocked, 1);
  assert.equal(roadmap.summary.active, 0);
});
