import assert from 'node:assert/strict';
import test from 'node:test';
import { WecomBotService } from '../src/wecomBotService.js';

test('replies with a knowledge answer when mentioned', async () => {
  const replies = [];
  const service = new WecomBotService({
    sdk: fakeSdk(),
    mentionName: '智能客服',
    knowledgeClient: {
      answer: async (question, context) => {
        assert.equal(question, '合同怎么签？');
        assert.equal(context.roomId, 'room-1');
        return '请先准备营业执照和联系人信息。';
      }
    }
  });

  const result = await service.handleMessage({
    text: { content: '@智能客服 合同怎么签？' },
    roomId: 'room-1',
    replyText: async (content) => replies.push(content)
  });

  assert.equal(result.replied, true);
  assert.deepEqual(replies, ['请先准备营业执照和联系人信息。']);
});

test('ignores messages that do not mention the bot', async () => {
  const service = new WecomBotService({
    sdk: fakeSdk(),
    mentionName: '智能客服',
    knowledgeClient: {
      answer: async () => {
        throw new Error('should not be called');
      }
    }
  });

  const result = await service.handleMessage({
    text: { content: '这个问题谁知道？' },
    replyText: async () => {
      throw new Error('should not reply');
    }
  });

  assert.deepEqual(result, { replied: false, reason: 'not_mentioned' });
});

test('sends a fallback reply when the knowledge client fails', async () => {
  const replies = [];
  const logs = [];
  const service = new WecomBotService({
    sdk: fakeSdk(),
    mentionName: '智能客服',
    logger: { error: (...args) => logs.push(args) },
    knowledgeClient: {
      answer: async () => {
        throw new Error('secret-key should not leak');
      }
    }
  });

  const result = await service.handleMessage({
    text: { content: '@智能客服 售后电话是多少？' },
    replyText: async (content) => replies.push(content)
  });

  assert.equal(result.error, true);
  assert.match(replies[0], /查询知识库失败/);
  assert.equal(logs[0][1].message, 'secret-key should not leak');
});

function fakeSdk() {
  return {
    onMessage: () => {},
    start: async () => {}
  };
}
