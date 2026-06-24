import { generateReqId } from '@wecom/aibot-node-sdk';
import { formatReply } from './replyFormatter.js';
import { shouldReplyToMessage } from './messageTrigger.js';

export class WecomBotService {
  constructor({ sdk, answerService, knowledgeClient, mentionName, maxReplyChars = 900, logger = console }) {
    this.sdk = sdk;
    this.answerService = answerService || legacyAnswerService(knowledgeClient);
    this.mentionName = mentionName;
    this.maxReplyChars = maxReplyChars;
    this.logger = logger;
  }

  async start() {
    this.sdk.on('authenticated', () => this.logger.info('企业微信智能机器人认证成功'));
    this.sdk.on('reconnecting', (attempt) => this.logger.warn(`企业微信连接断开，正在第 ${attempt} 次重连`));
    this.sdk.on('error', (error) => this.logger.error('企业微信 SDK 错误', sanitizeError(error)));
    this.sdk.on('message.text', async (frame) => {
      await this.handleFrame(frame);
    });

    this.sdk.connect();
  }

  async handleFrame(frame) {
    return this.handleMessage(frame.body, {
      reply: async (content) => {
        const streamId = generateReqId('knowledge');
        await this.sdk.replyStream(frame, streamId, content, true);
      }
    });
  }

  async handleMessage(message, replyTarget = message) {
    const trigger = shouldReplyToMessage(message, this.mentionName);
    if (!trigger.shouldReply) {
      return { replied: false, reason: 'not_mentioned' };
    }

    const context = {
      sender: message?.from?.userid || message?.fromUserId || message?.sender || message?.from,
      roomId: message?.chatid || message?.roomId || message?.chatId || message?.groupId
    };

    try {
      const result = await this.answerService.answer(trigger.question, {
        ...context,
        source: 'wecom'
      });
      const reply = formatReply(result.answer, this.maxReplyChars);
      await replyToMessage(replyTarget, reply);
      return { replied: true, reply };
    } catch (error) {
      this.logger.error('Failed to answer message', sanitizeError(error));
      const reply = '我刚才查询知识库失败了，稍后再试一下；紧急问题请先转人工确认。';
      await replyToMessage(replyTarget, reply);
      return { replied: true, reply, error: true };
    }
  }
}

function legacyAnswerService(knowledgeClient) {
  return {
    answer: async (question, context) => ({
      answer: await knowledgeClient.answer(question, context),
      matches: [],
      usedFallback: false
    })
  };
}

async function replyToMessage(target, content) {
  if (typeof target?.replyText === 'function') {
    await target.replyText(content);
    return;
  }

  if (typeof target?.reply === 'function') {
    await target.reply(content);
    return;
  }

  throw new Error('reply target does not expose a reply method');
}

function sanitizeError(error) {
  return {
    name: error?.name,
    message: error?.message
  };
}
