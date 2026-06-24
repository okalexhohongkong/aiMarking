import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBlockerReport } from '../src/blockerReport.js';

test('reports platform and module blockers in Chinese without leaking secret values', () => {
  const report = buildBlockerReport({
    now: new Date('2026-06-23T04:00:00.000Z'),
    env: {
      WECOM_BOT_SECRET: 'secret-value'
    }
  });

  const serialized = JSON.stringify(report);

  assert.equal(report.hasBlockers, true);
  assert.ok(report.message.includes('黑卫士七维AI营销系统出现需要处理的真实阻塞'));
  assert.ok(report.message.includes('全平台接入路线和核心模块进度'));
  assert.ok(report.message.includes('抖音私信/客服'));
  assert.ok(report.message.includes('小红书客服'));
  assert.ok(report.message.includes('多平台客服端口'));
  assert.ok(report.summary.platform > 3);
  assert.ok(report.summary.module >= 1);
  assert.equal(serialized.includes('secret-value'), false);
});

test('stays silent when every integration and module is unblocked', () => {
  const report = buildBlockerReport({
    env: {
      WECOM_BOT_ID: 'bot-id',
      WECOM_BOT_SECRET: 'bot-secret',
      DOUYIN_APP_ID: 'douyin-id',
      DOUYIN_APP_SECRET: 'douyin-secret',
      EASYCLAW_BASE_URL: 'http://127.0.0.1:10027',
      EASYCLAW_ACCESS_TOKEN: 'easyclaw-token',
      WECHAT_MINIAPP_APP_ID: 'miniapp-id',
      WECHAT_MINIAPP_APP_SECRET: 'miniapp-secret',
      WECHAT_MINIAPP_TOKEN: 'miniapp-token',
      KUAISHOU_APP_ID: 'kuaishou-id',
      KUAISHOU_APP_SECRET: 'kuaishou-secret',
      XHS_APP_ID: 'xhs-id',
      XHS_APP_SECRET: 'xhs-secret',
      WECHAT_CHANNELS_APP_ID: 'channels-id',
      WECHAT_CHANNELS_APP_SECRET: 'channels-secret',
      TAOBAO_APP_KEY: 'taobao-key',
      TAOBAO_APP_SECRET: 'taobao-secret',
      PDD_CLIENT_ID: 'pdd-id',
      PDD_CLIENT_SECRET: 'pdd-secret',
      JD_APP_KEY: 'jd-key',
      JD_APP_SECRET: 'jd-secret',
      SMS_PROVIDER: 'sms',
      SMS_ACCESS_KEY_ID: 'sms-id',
      SMS_ACCESS_KEY_SECRET: 'sms-secret',
      TOUTIAO_APP_ID: 'toutiao-id',
      TOUTIAO_APP_SECRET: 'toutiao-secret',
      BAIJIAHAO_APP_ID: 'baijiahao-id',
      BAIJIAHAO_APP_SECRET: 'baijiahao-secret',
      BILIBILI_APP_KEY: 'bilibili-key',
      BILIBILI_APP_SECRET: 'bilibili-secret',
      ZHIHU_CLIENT_ID: 'zhihu-id',
      ZHIHU_CLIENT_SECRET: 'zhihu-secret',
      LINKEDIN_CLIENT_ID: 'linkedin-id',
      LINKEDIN_CLIENT_SECRET: 'linkedin-secret',
      FACEBOOK_PAGE_ID: 'facebook-page',
      FACEBOOK_PAGE_ACCESS_TOKEN: 'facebook-token',
      FACEBOOK_VERIFY_TOKEN: 'facebook-verify',
      WHATSAPP_PHONE_NUMBER_ID: 'whatsapp-phone',
      WHATSAPP_BUSINESS_TOKEN: 'whatsapp-token',
      X_TWITTER_API_KEY: 'x-key',
      X_TWITTER_API_SECRET: 'x-secret',
      TIKTOK_CLIENT_KEY: 'tiktok-key',
      TIKTOK_CLIENT_SECRET: 'tiktok-secret'
    }
  });

  assert.equal(report.hasBlockers, false);
  assert.equal(report.message, '');
});
