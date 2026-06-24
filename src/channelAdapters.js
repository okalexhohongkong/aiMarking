import { getChannelPort, listChannelPorts } from './channelPorts.js';

const fieldMappings = {
  wecom: {
    sender: ['from.userid', 'fromUserId', 'sender', 'userId'],
    roomId: ['chatid', 'roomId', 'chatId', 'groupId'],
    text: ['text.content', 'content', 'text', 'message'],
    messageId: ['msgid', 'messageId', 'id']
  },
  'wechat-miniapp': {
    sender: ['FromUserName', 'openId', 'fromUserName', 'userId'],
    roomId: ['SessionFrom', 'conversationId', 'chatId'],
    text: ['Content', 'content', 'text'],
    messageId: ['MsgId', 'messageId', 'id']
  },
  'wechat-personal': {
    sender: ['fromUser', 'fromUserId', 'sender', 'userId'],
    roomId: ['roomId', 'chatId', 'conversationId'],
    text: ['text', 'content', 'message', 'text.content'],
    messageId: ['messageId', 'id']
  },
  douyin: {
    sender: ['openId', 'fromUserId', 'userId', 'sender'],
    roomId: ['conversationId', 'chatId', 'roomId'],
    text: ['content', 'text', 'message', 'text.content'],
    messageId: ['messageId', 'msgId', 'id']
  },
  kuaishou: {
    sender: ['openId', 'userId', 'fromUserId', 'sender'],
    roomId: ['conversationId', 'chatId', 'roomId'],
    text: ['content', 'text', 'message'],
    messageId: ['messageId', 'msgId', 'id']
  },
  xiaohongshu: {
    sender: ['userId', 'openId', 'fromUserId', 'sender'],
    roomId: ['chatId', 'conversationId', 'roomId'],
    text: ['text', 'content', 'message'],
    messageId: ['messageId', 'msgId', 'id']
  },
  'wechat-channels': {
    sender: ['openId', 'FromUserName', 'userId', 'sender'],
    roomId: ['conversationId', 'chatId', 'roomId'],
    text: ['content', 'Content', 'text', 'message'],
    messageId: ['messageId', 'MsgId', 'id']
  },
  taobao: {
    sender: ['buyerNick', 'buyerId', 'userId', 'sender'],
    roomId: ['sessionId', 'conversationId', 'orderId'],
    text: ['content', 'text', 'message'],
    messageId: ['messageId', 'msgId', 'id']
  },
  pinduoduo: {
    sender: ['buyerId', 'fromUserId', 'userId', 'sender'],
    roomId: ['sessionId', 'conversationId', 'orderSn'],
    text: ['content', 'text', 'message'],
    messageId: ['messageId', 'msgId', 'id']
  },
  jd: {
    sender: ['customerId', 'buyerId', 'userId', 'sender'],
    roomId: ['sessionId', 'conversationId', 'orderId'],
    text: ['content', 'text', 'message'],
    messageId: ['messageId', 'msgId', 'id']
  },
  sms: {
    sender: ['phoneNumber', 'mobile', 'from', 'sender', 'userId'],
    roomId: ['sessionId', 'conversationId', 'phoneNumber', 'mobile'],
    text: ['content', 'text', 'message', 'smsContent'],
    messageId: ['messageId', 'smsId', 'id']
  },
  toutiao: {
    sender: ['openId', 'userId', 'fromUserId', 'sender'],
    roomId: ['conversationId', 'chatId', 'commentId', 'roomId'],
    text: ['content', 'text', 'message', 'commentText'],
    messageId: ['messageId', 'msgId', 'commentId', 'id']
  },
  baijiahao: {
    sender: ['openId', 'userId', 'fromUserId', 'sender'],
    roomId: ['conversationId', 'chatId', 'commentId', 'roomId'],
    text: ['content', 'text', 'message', 'commentText'],
    messageId: ['messageId', 'msgId', 'commentId', 'id']
  },
  bilibili: {
    sender: ['mid', 'userId', 'sender', 'fromUserId'],
    roomId: ['sessionId', 'conversationId', 'commentId', 'roomId'],
    text: ['content', 'text', 'message', 'commentText'],
    messageId: ['messageId', 'msgId', 'commentId', 'id']
  },
  zhihu: {
    sender: ['memberId', 'userId', 'sender', 'fromUserId'],
    roomId: ['conversationId', 'questionId', 'answerId', 'roomId'],
    text: ['content', 'text', 'message', 'commentText'],
    messageId: ['messageId', 'commentId', 'id']
  },
  linkedin: {
    sender: ['personId', 'memberId', 'sender', 'userId'],
    roomId: ['conversationId', 'threadId', 'roomId'],
    text: ['text', 'content', 'message'],
    messageId: ['messageId', 'eventId', 'id']
  },
  facebook: {
    sender: ['sender.id', 'from.id', 'userId', 'sender'],
    roomId: ['recipient.id', 'conversationId', 'threadId', 'roomId'],
    text: ['message.text', 'content', 'text', 'message'],
    messageId: ['message.mid', 'messageId', 'mid', 'id']
  },
  whatsapp: {
    sender: ['contacts.0.wa_id', 'from', 'phoneNumber', 'sender', 'userId'],
    roomId: ['phoneNumberId', 'metadata.phone_number_id', 'conversationId', 'roomId'],
    text: ['messages.0.text.body', 'text.body', 'content', 'text', 'message'],
    messageId: ['messages.0.id', 'messageId', 'wamid', 'id']
  },
  'x-twitter': {
    sender: ['sender_id', 'senderId', 'userId', 'sender'],
    roomId: ['dm_conversation_id', 'conversationId', 'threadId', 'roomId'],
    text: ['text', 'content', 'message'],
    messageId: ['eventId', 'messageId', 'id']
  },
  tiktok: {
    sender: ['openId', 'userId', 'fromUserId', 'sender'],
    roomId: ['conversationId', 'chatId', 'commentId', 'roomId'],
    text: ['content', 'text', 'message', 'commentText'],
    messageId: ['messageId', 'msgId', 'commentId', 'id']
  }
};

export function createChannelAdapterRegistry({ env = process.env } = {}) {
  const adapters = new Map(listChannelPorts(env).map((port) => [port.id, createChannelAdapter(port)]));
  return {
    get(channelId) {
      return adapters.get(channelId) || null;
    },
    list() {
      return [...adapters.values()];
    }
  };
}

export function createChannelAdapter(port) {
  return {
    channelId: port.id,
    port,
    normalizeIncoming(payload = {}) {
      return normalizeIncomingForPort(port.id, payload);
    },
    async simulate(payload, { channelMessageService, replySender = defaultReplySender } = {}) {
      if (!channelMessageService) {
        throw new Error('channelMessageService is required');
      }
      const message = normalizeIncomingForPort(port.id, payload);
      const result = await channelMessageService.handleIncoming(message);
      const delivery = result.replied ? await replySender(message, result.reply, { port }) : { delivered: false };
      return {
        ...result,
        message,
        delivery
      };
    }
  };
}

export function normalizeIncomingForPort(channelId, payload = {}) {
  const mapping = fieldMappings[channelId] || fieldMappings.wecom;
  return {
    channelId,
    sender: firstValue(payload, mapping.sender),
    roomId: firstValue(payload, mapping.roomId),
    text: String(firstValue(payload, mapping.text) || '').trim(),
    messageId: firstValue(payload, mapping.messageId),
    raw: payload
  };
}

export function getChannelAdapter(channelId, env = process.env) {
  const port = getChannelPort(channelId, env);
  return port ? createChannelAdapter(port) : null;
}

async function defaultReplySender(message, reply, { port } = {}) {
  return {
    delivered: true,
    mode: 'simulated',
    channelId: port?.id || message.channelId,
    reply
  };
}

function firstValue(source, paths) {
  for (const path of paths) {
    const value = getPath(source, path);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return null;
}

function getPath(source, path) {
  return path.split('.').reduce((value, key) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    return value[key];
  }, source);
}
