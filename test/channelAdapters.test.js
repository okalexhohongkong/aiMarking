import assert from 'node:assert/strict';
import test from 'node:test';
import { createChannelAdapterRegistry } from '../src/channelAdapters.js';

test('normalizes a channel payload through a registered adapter', () => {
  const registry = createChannelAdapterRegistry();
  const adapter = registry.get('douyin');
  const normalized = adapter.normalizeIncoming({
    openId: 'open-1',
    conversationId: 'conv-1',
    content: '合同怎么签？',
    messageId: 'msg-1'
  });

  assert.deepEqual(normalized, {
    channelId: 'douyin',
    sender: 'open-1',
    roomId: 'conv-1',
    text: '合同怎么签？',
    messageId: 'msg-1',
    raw: {
      openId: 'open-1',
      conversationId: 'conv-1',
      content: '合同怎么签？',
      messageId: 'msg-1'
    }
  });
});

test('simulates a channel message through the shared customer service engine', async () => {
  const sentReplies = [];
  const registry = createChannelAdapterRegistry();
  const adapter = registry.get('xiaohongshu');
  const result = await adapter.simulate(
    {
      userId: 'user-1',
      chatId: 'chat-1',
      text: '售后怎么处理？'
    },
    {
      channelMessageService: {
        handleIncoming: async (message) => {
          assert.equal(message.channelId, 'xiaohongshu');
          assert.equal(message.sender, 'user-1');
          assert.equal(message.roomId, 'chat-1');
          assert.equal(message.text, '售后怎么处理？');
          return { replied: true, reply: '请发订单号和问题截图。' };
        }
      },
      replySender: async (message, reply) => {
        sentReplies.push({ message, reply });
        return { delivered: true };
      }
    }
  );

  assert.equal(result.replied, true);
  assert.equal(result.delivery.delivered, true);
  assert.equal(sentReplies[0].reply, '请发订单号和问题截图。');
});

test('exposes ecommerce adapters with platform-only policy metadata', () => {
  const registry = createChannelAdapterRegistry();
  const adapter = registry.get('taobao');

  assert.equal(adapter.channelId, 'taobao');
  assert.equal(adapter.port.privateTrafficPolicy, '仅平台内承接，不直接站外引流');
});

test('all adapters accept the shared dashboard simulator payload', () => {
  const registry = createChannelAdapterRegistry();
  const payload = {
    sender: 'sim-user',
    userId: 'sim-user',
    openId: 'sim-user',
    fromUserId: 'sim-user',
    FromUserName: 'sim-user',
    buyerNick: 'sim-user',
    customerId: 'sim-user',
    roomId: 'sim-room',
    chatId: 'sim-room',
    conversationId: 'sim-room',
    SessionFrom: 'sim-room',
    sessionId: 'sim-room',
    text: '  合同怎么签？  ',
    content: '  合同怎么签？  ',
    message: '  合同怎么签？  ',
    messageId: 'sim-message'
  };

  for (const adapter of registry.list()) {
    const normalized = adapter.normalizeIncoming(payload);
    assert.equal(normalized.text, '合同怎么签？');
    assert.equal(normalized.sender, 'sim-user');
    assert.equal(normalized.roomId, 'sim-room');
  }
});

test('normalizes reserved global and communication channel payloads', () => {
  const registry = createChannelAdapterRegistry();

  const sms = registry.get('sms').normalizeIncoming({
    phoneNumber: '13800000000',
    smsContent: '想了解活动优惠',
    smsId: 'sms-1'
  });
  assert.equal(sms.sender, '13800000000');
  assert.equal(sms.roomId, '13800000000');
  assert.equal(sms.text, '想了解活动优惠');
  assert.equal(sms.messageId, 'sms-1');

  const facebook = registry.get('facebook').normalizeIncoming({
    sender: { id: 'fb-user-1' },
    recipient: { id: 'page-1' },
    message: { text: 'How can I book?', mid: 'fb-mid-1' }
  });
  assert.equal(facebook.sender, 'fb-user-1');
  assert.equal(facebook.roomId, 'page-1');
  assert.equal(facebook.text, 'How can I book?');
  assert.equal(facebook.messageId, 'fb-mid-1');

  const whatsapp = registry.get('whatsapp').normalizeIncoming({
    contacts: [{ wa_id: '85200000000' }],
    metadata: { phone_number_id: 'phone-number-1' },
    messages: [{ id: 'wamid-1', text: { body: 'Need price list' } }]
  });
  assert.equal(whatsapp.sender, '85200000000');
  assert.equal(whatsapp.roomId, 'phone-number-1');
  assert.equal(whatsapp.text, 'Need price list');
  assert.equal(whatsapp.messageId, 'wamid-1');
});
