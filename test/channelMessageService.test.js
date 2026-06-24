import assert from 'node:assert/strict';
import test from 'node:test';
import { ChannelMessageService } from '../src/channelMessageService.js';

test('answers a normalized customer message from a reserved content platform', async () => {
  const service = new ChannelMessageService({
    answerService: {
      answer: async (question, context) => {
        assert.equal(question, '合同怎么签？');
        assert.equal(context.source, 'douyin');
        assert.equal(context.sender, 'user-1');
        return { answer: '请先准备营业执照、联系人手机号和开票信息。' };
      }
    }
  });

  const result = await service.handleIncoming({
    channelId: 'douyin',
    sender: 'user-1',
    text: '合同怎么签？'
  });

  assert.equal(result.replied, true);
  assert.equal(result.reply, '请先准备营业执照、联系人手机号和开票信息。');
  assert.equal(result.policy.requiresHumanApproval, true);
});

test('marks ecommerce channels as platform-only for private traffic guidance', async () => {
  const service = new ChannelMessageService({
    answerService: {
      answer: async () => ({ answer: '可以在当前平台客服窗口继续咨询。' })
    }
  });

  const result = await service.handleIncoming({
    channelId: 'taobao',
    sender: 'buyer-1',
    text: '能加微信发资料吗？'
  });

  assert.equal(result.replied, true);
  assert.equal(result.policy.privateTrafficAllowed, false);
  assert.equal(result.policy.guidance, '仅平台内承接，不直接站外引流');
});

test('ignores blank channel messages before calling answer service', async () => {
  const service = new ChannelMessageService({
    answerService: {
      answer: async () => {
        throw new Error('should not be called');
      }
    }
  });

  const result = await service.handleIncoming({
    channelId: 'xiaohongshu',
    sender: 'user-1',
    text: '   '
  });

  assert.deepEqual(result, { replied: false, reason: 'empty_message' });
});

test('returns a safe fallback when a channel answer fails', async () => {
  const service = new ChannelMessageService({
    answerService: {
      answer: async () => {
        throw new Error('secret-key should not be exposed');
      }
    },
    logger: { error: () => {} }
  });

  const result = await service.handleIncoming({
    channelId: 'kuaishou',
    sender: 'user-1',
    text: '售后电话是多少？'
  });

  assert.equal(result.replied, true);
  assert.equal(result.error, true);
  assert.match(result.reply, /转人工确认/);
});
