import { getChannelPort } from './channelPorts.js';
import { formatReply } from './replyFormatter.js';

const ecommerceChannelIds = new Set(['taobao', 'pinduoduo', 'jd']);

export class ChannelMessageService {
  constructor({ answerService, maxReplyChars = 900, logger = console }) {
    this.answerService = answerService;
    this.maxReplyChars = maxReplyChars;
    this.logger = logger;
  }

  async handleIncoming(message) {
    const normalized = normalizeIncomingMessage(message);
    if (!normalized.text) {
      return { replied: false, reason: 'empty_message' };
    }

    const port = getChannelPort(normalized.channelId) || {
      id: normalized.channelId,
      name: normalized.channelId || 'unknown',
      privateTrafficPolicy: '未知渠道，默认人工确认'
    };
    const policy = buildChannelPolicy(port);

    try {
      const result = await this.answerService.answer(normalized.text, {
        source: port.id,
        sender: normalized.sender,
        roomId: normalized.roomId,
        channel: port.name,
        privateTrafficAllowed: policy.privateTrafficAllowed,
        requiresHumanApproval: policy.requiresHumanApproval
      });

      return {
        replied: true,
        channelId: port.id,
        channelName: port.name,
        reply: formatReply(result.answer, this.maxReplyChars),
        policy,
        answer: result
      };
    } catch (error) {
      this.logger.error('Channel message answer failed', sanitizeError(error));
      return {
        replied: true,
        channelId: port.id,
        channelName: port.name,
        reply: '这个问题我先记录下来，需要转人工确认后再答复你。',
        policy,
        error: true
      };
    }
  }
}

export function normalizeIncomingMessage(message = {}) {
  return {
    channelId: String(message.channelId || message.platform || message.source || 'unknown').trim(),
    sender: message.sender || message.fromUserId || message.userId || message.openId || null,
    roomId: message.roomId || message.chatId || message.groupId || null,
    text: extractText(message).trim()
  };
}

export function buildChannelPolicy(port) {
  const privateTrafficAllowed = !ecommerceChannelIds.has(port.id);
  return {
    privateTrafficAllowed,
    requiresHumanApproval: true,
    guidance: privateTrafficAllowed ? port.privateTrafficPolicy : '仅平台内承接，不直接站外引流'
  };
}

function extractText(message) {
  if (typeof message.text === 'string') {
    return message.text;
  }

  if (typeof message.content === 'string') {
    return message.content;
  }

  if (typeof message.text?.content === 'string') {
    return message.text.content;
  }

  if (typeof message.message === 'string') {
    return message.message;
  }

  return '';
}

function sanitizeError(error) {
  return {
    name: error?.name,
    message: error?.message
  };
}
