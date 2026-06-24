import 'dotenv/config';
import { summarizeChannelPorts } from './channelPorts.js';

export function readConfig(env = process.env) {
  return {
    wecom: {
      botId: required(env.WECOM_BOT_ID, 'WECOM_BOT_ID'),
      botSecret: required(env.WECOM_BOT_SECRET, 'WECOM_BOT_SECRET'),
      wsUrl: optional(env.WECOM_WS_URL)
    },
    bot: {
      mentionName: env.BOT_MENTION_NAME || '智能客服',
      maxReplyChars: toPositiveInt(env.MAX_REPLY_CHARS, 900)
    },
    admin: {
      host: env.ADMIN_HOST || '127.0.0.1',
      port: toPositiveInt(env.ADMIN_PORT, 8787)
    },
    knowledge: {
      baseUrl: trimTrailingSlash(env.OPENAI_BASE_URL || 'http://127.0.0.1:3688/v1'),
      apiKey: required(env.OPENAI_API_KEY || env.CCX_ACCESS_KEY, 'OPENAI_API_KEY'),
      model: env.OPENAI_MODEL || 'gpt-4.1-mini',
      knowledgeBaseName: env.KNOWLEDGE_BASE_NAME || '奥普C在知识库',
      systemPrompt:
        env.KNOWLEDGE_SYSTEM_PROMPT ||
        '你是黑卫士七维AI营销系统的客服承接助手，只能根据奥普C在知识库回答。答案要简洁、准确；不知道时请说明需要人工确认。'
    }
  };
}

export function readAdminConfig(env = process.env) {
  return {
    bot: {
      mentionName: env.BOT_MENTION_NAME || '智能客服',
      maxReplyChars: toPositiveInt(env.MAX_REPLY_CHARS, 900)
    },
    admin: {
      host: env.ADMIN_HOST || '127.0.0.1',
      port: toPositiveInt(env.ADMIN_PORT, 8787)
    },
    knowledge: {
      baseUrl: trimTrailingSlash(env.OPENAI_BASE_URL || 'http://127.0.0.1:3688/v1'),
      apiKey: optional(env.OPENAI_API_KEY || env.CCX_ACCESS_KEY),
      model: env.OPENAI_MODEL || 'gpt-4.1-mini',
      knowledgeBaseName: env.KNOWLEDGE_BASE_NAME || '奥普C在知识库',
      systemPrompt:
        env.KNOWLEDGE_SYSTEM_PROMPT ||
        '你是黑卫士七维AI营销系统的客服承接助手，只能根据奥普C在知识库回答。答案要简洁、准确；不知道时请说明需要人工确认。'
    }
  };
}

export function readConfigSummary(env = process.env) {
  return {
    botMentionName: env.BOT_MENTION_NAME || '智能客服',
    knowledgeBaseName: env.KNOWLEDGE_BASE_NAME || '奥普C在知识库',
    openaiBaseUrl: trimTrailingSlash(env.OPENAI_BASE_URL || 'http://127.0.0.1:3688/v1'),
    hasWecomCredentials: Boolean(env.WECOM_BOT_ID?.trim() && env.WECOM_BOT_SECRET?.trim()),
    hasOpenAiKey: Boolean((env.OPENAI_API_KEY || env.CCX_ACCESS_KEY)?.trim()),
    channelPorts: summarizeChannelPorts(env)
  };
}

function required(value, name) {
  if (!value || !String(value).trim()) {
    throw new Error(`${name} is not configured`);
  }
  return String(value).trim();
}

function optional(value) {
  const normalized = String(value || '').trim();
  return normalized || undefined;
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}
