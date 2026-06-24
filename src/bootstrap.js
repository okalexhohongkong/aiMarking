import AiBot from '@wecom/aibot-node-sdk';
import { join } from 'node:path';
import { AnswerService } from './answerService.js';
import { createAdminServer } from './adminServer.js';
import { ChannelMessageService } from './channelMessageService.js';
import { readAdminConfig, readConfig, readConfigSummary } from './config.js';
import { JsonDataStore } from './dataStore.js';
import { KnowledgeClient } from './knowledgeClient.js';
import { getPlatformConfigEnvPath, readPlatformConfigEnv } from './platformConfig.js';
import { WecomBotService } from './wecomBotService.js';

export async function createSystem({ startBot = true, startAdmin = true, env = process.env } = {}) {
  const platformConfigEnvPath = getPlatformConfigEnvPath({ env });
  const fileEnv = await readPlatformConfigEnv(platformConfigEnvPath);
  const runtimeEnv = mergeEnv(fileEnv, env);
  Object.assign(env, runtimeEnv);
  const config = startBot ? readConfig(runtimeEnv) : readAdminConfig(runtimeEnv);
  const store = new JsonDataStore({
    dataDir: runtimeEnv.DATA_DIR || join(process.cwd(), 'data')
  });
  await store.init();

  const knowledgeClient = new KnowledgeClient(config.knowledge);
  const answerService = new AnswerService({
    store,
    llmClient: knowledgeClient
  });
  const channelMessageService = new ChannelMessageService({
    answerService,
    maxReplyChars: config.bot.maxReplyChars
  });

  let adminServer;
  if (startAdmin) {
    adminServer = createAdminServer({
      store,
      answerService,
      channelMessageService,
      configSummary: readConfigSummary(runtimeEnv),
      platformConfigEnvPath,
      env: runtimeEnv
    });
  }

  let botService;
  if (startBot) {
    const sdk = new AiBot.WSClient({
      botId: config.wecom.botId,
      secret: config.wecom.botSecret,
      wsUrl: config.wecom.wsUrl,
      maxReconnectAttempts: -1
    });

    botService = new WecomBotService({
      sdk,
      answerService,
      mentionName: config.bot.mentionName,
      maxReplyChars: config.bot.maxReplyChars
    });
  }

  return {
    config,
    store,
    answerService,
    channelMessageService,
    adminServer,
    botService
  };
}

function mergeEnv(fileEnv, runtimeEnv) {
  const merged = { ...fileEnv };
  for (const [key, value] of Object.entries(runtimeEnv || {})) {
    if (String(value || '').trim()) {
      merged[key] = value;
    }
  }
  return merged;
}
