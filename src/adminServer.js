import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { buildAgentAccessBlueprint } from './agentAccessBlueprint.js';
import { getMarketingSystemBlueprint } from './aiMarketingSystem.js';
import { buildCallCrmBlueprint } from './callCrmBlueprint.js';
import { getChannelAdapter } from './channelAdapters.js';
import { ChannelMessageService } from './channelMessageService.js';
import { listChannelPorts } from './channelPorts.js';
import { readAdminConfig, readConfigSummary } from './config.js';
import { getCustomerLifecycleBlueprint } from './customerLifecycle.js';
import { buildDouyinReadiness } from './douyinReadiness.js';
import { getEngagementPlaybooks } from './engagementPlaybooks.js';
import { generateGrowthReply } from './growthEngine.js';
import { buildHermesCommandPayload } from './hermesCommandInbox.js';
import { buildIntegrationRoadmap } from './integrationRoadmap.js';
import { LocalOperations } from './localOperations.js';
import { buildOrchestrationPlan } from './orchestrationPlan.js';
import { buildPlatformConfigStatus, getPlatformConfigEnvPath, readPlatformConfigEnv, savePlatformConfig } from './platformConfig.js';
import { generatePrivateMessageContext } from './privateMessageGenerator.js';
import { buildProjectProgress } from './projectProgress.js';
import { buildResilienceBackupBlueprint } from './resilienceBackupBlueprint.js';
import { retrieveKnowledge } from './retriever.js';
import { buildWechatPersonalReadiness } from './wechatPersonalReadiness.js';
import { buildWecomReadiness } from './wecomReadiness.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const maxBodyBytes = 512 * 1024;

const knowledgeSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(8000),
  tags: z.union([z.array(z.string().max(30)), z.string()]).optional().default([]),
  category: z.string().trim().max(80).optional().default(''),
  scenarios: z.union([z.array(z.string().max(80)), z.string()]).optional().default([]),
  concepts: z.union([z.array(z.string().max(80)), z.string()]).optional().default([]),
  steps: z.union([z.array(z.string().max(300)), z.string()]).optional().default([])
});

const askSchema = z.object({
  question: z.string().trim().min(1).max(1000)
});

const growthScriptSchema = z.object({
  scene: z.string().trim().min(1).max(80),
  customerStage: z.string().trim().min(1).max(80),
  painPoint: z.string().trim().max(120).optional().default(''),
  tone: z.string().trim().max(80).optional().default('顾问'),
  goal: z.string().trim().min(1).max(80),
  template: z.string().trim().min(1).max(1000)
});

const growthMaterialSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.string().trim().min(1).max(80),
  description: z.string().trim().max(1000).optional().default(''),
  cta: z.string().trim().max(300).optional().default('')
});

const growthRuleSchema = z.object({
  name: z.string().trim().min(1).max(120),
  keywords: z.union([z.array(z.string().max(40)), z.string()]).optional().default([]),
  scene: z.string().trim().min(1).max(80),
  enabled: z.boolean().optional().default(true)
});

const growthGenerateSchema = z.object({
  platform: z.string().trim().min(1).max(80),
  customerName: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(1).max(1000),
  customerStage: z.string().trim().max(80).optional().default('陌生'),
  goal: z.string().trim().max(80).optional().default('加企微'),
  interactionCount: z.number().int().min(1).max(50).optional().default(1)
});

const privateMessageGenerateSchema = z.object({
  platform: z.string().trim().max(80).optional().default('平台私信'),
  customerName: z.string().trim().max(120).optional().default(''),
  ipProvince: z.string().trim().max(80).optional().default(''),
  ipCity: z.string().trim().max(80).optional().default(''),
  postPlatform: z.string().trim().max(80).optional().default(''),
  postLocation: z.string().trim().max(120).optional().default(''),
  postTitle: z.string().trim().max(160).optional().default(''),
  postPublishedAt: z.string().trim().max(80).optional().default(''),
  commentedAt: z.string().trim().max(80).optional().default(''),
  commentText: z.string().trim().min(1).max(1000),
  contentRelation: z.string().trim().max(500).optional().default(''),
  sentiment: z.string().trim().max(80).optional().default('unknown'),
  genderGuess: z.string().trim().max(80).optional().default('unknown'),
  needOwner: z.enum(['本人', '家人', '朋友', '未知']).optional().default('未知'),
  solution: z.string().trim().max(300).optional().default('相关咨询'),
  offer: z.string().trim().max(300).optional().default('一份整理好的资料'),
  officialSiteUrl: z.string().trim().max(500).optional().default(''),
  groupInviteUrl: z.string().trim().max(500).optional().default(''),
  contactUrl: z.string().trim().max(500).optional().default(''),
  contactCardType: z.string().trim().max(80).optional().default(''),
  contactCardTitle: z.string().trim().max(160).optional().default(''),
  contactCardDescription: z.string().trim().max(300).optional().default(''),
  contactCardUrl: z.string().trim().max(500).optional().default(''),
  companyVerification: z.string().trim().max(500).optional().default('')
});

const privateMessageApprovalSchema = z.object({
  platform: z.string().trim().max(80).optional().default('平台私信'),
  customerName: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(1).max(3000),
  sourceTrace: z.string().trim().max(500).optional().default(''),
  sendReadiness: z.string().trim().max(500).optional().default(''),
  invitationTarget: z.string().trim().max(200).optional().default(''),
  riskNotes: z.string().trim().max(800).optional().default(''),
  createdBy: z.string().trim().max(120).optional().default('dashboard')
});

const privateMessageApprovalStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'sent', 'archived']),
  reviewerNote: z.string().trim().max(1000).optional().default('')
});

const hermesCommandSchema = z.object({
  source: z.string().trim().max(80).optional().default('hermes'),
  sender: z.string().trim().max(120).optional().default(''),
  text: z.string().trim().min(1).max(3000),
  priority: z.string().trim().max(40).optional().default('normal'),
  direction: z.enum(['inbound', 'outbound']).optional().default('inbound'),
  type: z.enum(['task', 'blocker', 'progress', 'split', 'merge']).optional().default('task'),
  target: z.string().trim().max(120).optional().default('codex'),
  moduleId: z.string().trim().max(120).optional().default(''),
  taskId: z.string().trim().max(120).optional().default('')
});

const hermesCommandStatusSchema = z.object({
  status: z.enum(['new', 'accepted', 'done', 'ignored'])
});

const hermesBlockerReportSchema = z.object({
  moduleId: z.string().trim().min(1).max(120),
  taskId: z.string().trim().max(120).optional().default(''),
  title: z.string().trim().min(1).max(160),
  missing: z.union([z.array(z.string().trim().max(120)), z.string().trim().max(500)]).optional().default([]),
  nextStep: z.string().trim().min(1).max(500)
});

const platformConfigSaveSchema = z.object({
  sectionId: z.string().trim().min(1).max(120),
  values: z.record(z.string().trim().min(1).max(120), z.string().max(4000)).optional().default({})
});

const channelSimulateSchema = z
  .object({
    sender: z.string().trim().max(120).optional(),
    userId: z.string().trim().max(120).optional(),
    openId: z.string().trim().max(120).optional(),
    fromUserId: z.string().trim().max(120).optional(),
    FromUserName: z.string().trim().max(120).optional(),
    buyerNick: z.string().trim().max(120).optional(),
    buyerId: z.string().trim().max(120).optional(),
    customerId: z.string().trim().max(120).optional(),
    roomId: z.string().trim().max(120).optional(),
    chatId: z.string().trim().max(120).optional(),
    groupId: z.string().trim().max(120).optional(),
    conversationId: z.string().trim().max(120).optional(),
    SessionFrom: z.string().trim().max(120).optional(),
    sessionId: z.string().trim().max(120).optional(),
    orderId: z.string().trim().max(120).optional(),
    orderSn: z.string().trim().max(120).optional(),
    content: z.string().trim().max(1000).optional(),
    text: z.string().trim().max(1000).optional(),
    message: z.string().trim().max(1000).optional(),
    messageId: z.string().trim().max(120).optional(),
    msgId: z.string().trim().max(120).optional(),
    MsgId: z.string().trim().max(120).optional()
  })
  .passthrough()
  .refine((value) => [value.content, value.text, value.message].some((item) => String(item || '').trim()), {
    message: 'message text is required'
  });

export function createAdminServer({
  store,
  answerService,
  channelMessageService,
  configSummary,
  localOperations,
  platformConfigEnvPath = getPlatformConfigEnvPath(),
  env = process.env
}) {
  const resolvedChannelMessageService = channelMessageService || new ChannelMessageService({ answerService });
  const resolvedLocalOperations = localOperations || new LocalOperations();
  return createServer(async (request, response) => {
    try {
      await routeRequest({
        request,
        response,
        store,
        answerService,
        channelMessageService: resolvedChannelMessageService,
        configSummary,
        localOperations: resolvedLocalOperations,
        platformConfigEnvPath,
        env
      });
    } catch (error) {
      console.error('Admin server error', { name: error?.name, message: error?.message });
      sendJson(response, 500, { error: '服务器处理失败，请稍后再试。' });
    }
  });
}

async function routeRequest({
  request,
  response,
  store,
  answerService,
  channelMessageService,
  configSummary,
  localOperations,
  platformConfigEnvPath,
  env
}) {
  const url = new URL(request.url, 'http://127.0.0.1');

  if (url.pathname === '/api/status' && request.method === 'GET') {
    const runtimeEnv = await resolveServerEnv(env, platformConfigEnvPath);
    sendJson(response, 200, {
      ...configSummary,
      ...readConfigSummary(runtimeEnv),
      knowledgeCount: (await store.listKnowledgeItems()).length,
      conversationCount: (await store.listConversationLogs({ limit: 1000 })).length
    });
    return;
  }

  if (url.pathname === '/api/local/status' && request.method === 'GET') {
    sendJson(response, 200, await localOperations.getDataStatus());
    return;
  }

  if (url.pathname === '/api/local/backup' && request.method === 'POST') {
    sendJson(response, 201, await localOperations.createBackup({ label: 'dashboard' }));
    return;
  }

  if (url.pathname === '/api/local/export-knowledge' && request.method === 'POST') {
    sendJson(response, 201, await localOperations.exportKnowledge());
    return;
  }

  if (url.pathname === '/api/local/export-knowledge-template' && request.method === 'POST') {
    sendJson(response, 201, await localOperations.exportKnowledgeTemplate());
    return;
  }

  if (url.pathname === '/api/knowledge' && request.method === 'GET') {
    sendJson(response, 200, await store.listKnowledgeItems());
    return;
  }

  if (url.pathname === '/api/channel-ports' && request.method === 'GET') {
    sendJson(response, 200, listChannelPorts(await resolveServerEnv(env, platformConfigEnvPath)));
    return;
  }

  if (url.pathname === '/api/platform-config' && request.method === 'GET') {
    sendJson(response, 200, await buildPlatformConfigStatus({ env, envPath: platformConfigEnvPath }));
    return;
  }

  if (url.pathname === '/api/platform-config' && request.method === 'POST') {
    const parsed = platformConfigSaveSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '请选择平台，并填写要保存的配置项。' });
      return;
    }
    try {
      const result = await savePlatformConfig({
        sectionId: parsed.data.sectionId,
        values: parsed.data.values,
        env,
        envPath: platformConfigEnvPath
      });
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 400, { error: error?.message || '平台配置保存失败。' });
    }
    return;
  }

  if (url.pathname === '/api/project-progress' && request.method === 'GET') {
    sendJson(response, 200, buildProjectProgress({ env: await resolveServerEnv(env, platformConfigEnvPath) }));
    return;
  }

  if (url.pathname === '/api/call-crm-blueprint' && request.method === 'GET') {
    sendJson(response, 200, buildCallCrmBlueprint({ env: await resolveServerEnv(env, platformConfigEnvPath) }));
    return;
  }

  if (url.pathname === '/api/resilience-backup-blueprint' && request.method === 'GET') {
    sendJson(response, 200, buildResilienceBackupBlueprint({ localStatus: await localOperations.getDataStatus() }));
    return;
  }

  if (url.pathname === '/api/agent-access-blueprint' && request.method === 'GET') {
    sendJson(response, 200, buildAgentAccessBlueprint({ env: await resolveServerEnv(env, platformConfigEnvPath) }));
    return;
  }

  if (url.pathname === '/api/orchestration-plan' && request.method === 'GET') {
    sendJson(response, 200, buildOrchestrationPlan());
    return;
  }

  if (url.pathname === '/api/integration-roadmap' && request.method === 'GET') {
    sendJson(response, 200, buildIntegrationRoadmap({ env: await resolveServerEnv(env, platformConfigEnvPath) }));
    return;
  }

  if (url.pathname === '/api/wecom/readiness' && request.method === 'GET') {
    const runtimeEnv = await resolveServerEnv(env, platformConfigEnvPath);
    const adminConfig = readAdminConfig(runtimeEnv);
    sendJson(
      response,
      200,
      buildWecomReadiness({
        env: runtimeEnv,
        host: adminConfig.admin.host,
        port: adminConfig.admin.port
      })
    );
    return;
  }

  if (url.pathname === '/api/douyin/readiness' && request.method === 'GET') {
    const runtimeEnv = await resolveServerEnv(env, platformConfigEnvPath);
    const adminConfig = readAdminConfig(runtimeEnv);
    sendJson(
      response,
      200,
      buildDouyinReadiness({
        env: runtimeEnv,
        host: adminConfig.admin.host,
        port: adminConfig.admin.port
      })
    );
    return;
  }

  if (url.pathname === '/api/wechat-personal/readiness' && request.method === 'GET') {
    const runtimeEnv = await resolveServerEnv(env, platformConfigEnvPath);
    const adminConfig = readAdminConfig(runtimeEnv);
    sendJson(
      response,
      200,
      buildWechatPersonalReadiness({
        env: runtimeEnv,
        host: adminConfig.admin.host,
        port: adminConfig.admin.port
      })
    );
    return;
  }

  if (url.pathname === '/api/marketing-system' && request.method === 'GET') {
    sendJson(response, 200, getMarketingSystemBlueprint());
    return;
  }

  if (url.pathname === '/api/customer-lifecycle' && request.method === 'GET') {
    sendJson(response, 200, getCustomerLifecycleBlueprint());
    return;
  }

  if (url.pathname === '/api/engagement-playbooks' && request.method === 'GET') {
    sendJson(response, 200, getEngagementPlaybooks());
    return;
  }

  if (url.pathname === '/api/private-message/generate' && request.method === 'POST') {
    const parsed = privateMessageGenerateSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '请输入留言内容，并检查私信字段长度。' });
      return;
    }
    const knowledgeMatches = retrieveKnowledge(buildPrivateMessageKnowledgeQuery(parsed.data), await store.listKnowledgeItems(), {
      limit: 3
    });
    sendJson(response, 200, generatePrivateMessageContext({ ...parsed.data, knowledgeMatches }));
    return;
  }

  if (url.pathname === '/api/private-message/approvals' && request.method === 'GET') {
    const limit = Number.parseInt(url.searchParams.get('limit') || '50', 10);
    sendJson(response, 200, await store.listPrivateMessageApprovals({ limit: clamp(limit, 1, 100) }));
    return;
  }

  if (url.pathname === '/api/private-message/approvals' && request.method === 'POST') {
    const parsed = privateMessageApprovalSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '请先生成可审核的私信内容。' });
      return;
    }
    sendJson(response, 201, await store.createPrivateMessageApproval(parsed.data));
    return;
  }

  const privateMessageApprovalMatch = url.pathname.match(/^\/api\/private-message\/approvals\/([^/]+)$/);
  if (privateMessageApprovalMatch && request.method === 'PUT') {
    const parsed = privateMessageApprovalStatusSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '请选择有效的审批状态。' });
      return;
    }
    const updated = await store.updatePrivateMessageApproval(privateMessageApprovalMatch[1], parsed.data);
    sendJson(response, updated ? 200 : 404, updated || { error: '没有找到这条私信审批记录。' });
    return;
  }

  const channelSimulateMatch = url.pathname.match(/^\/api\/channels\/([^/]+)\/simulate$/);
  if (channelSimulateMatch && request.method === 'POST') {
    const adapter = getChannelAdapter(channelSimulateMatch[1], await resolveServerEnv(env, platformConfigEnvPath));
    if (!adapter) {
      sendJson(response, 404, { error: '没有找到这个客服端口。' });
      return;
    }
    const parsed = channelSimulateSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '请输入要模拟的客户消息。' });
      return;
    }
    const result = await adapter.simulate(parsed.data, { channelMessageService });
    sendJson(response, 200, result);
    return;
  }

  if (url.pathname === '/api/knowledge-graph' && request.method === 'GET') {
    const { buildKnowledgeGraph } = await import('./knowledgeGraph.js');
    sendJson(response, 200, buildKnowledgeGraph(await store.listKnowledgeItems()));
    return;
  }

  if (url.pathname === '/api/knowledge' && request.method === 'POST') {
    const body = await readJsonBody(request);
    const parsed = knowledgeSchema.safeParse(body);
    if (!parsed.success) {
      sendJson(response, 400, { error: '知识库内容不完整。' });
      return;
    }
    sendJson(response, 201, await store.createKnowledgeItem(parsed.data));
    return;
  }

  const knowledgeMatch = url.pathname.match(/^\/api\/knowledge\/([^/]+)$/);
  if (knowledgeMatch && request.method === 'PUT') {
    const body = await readJsonBody(request);
    const parsed = knowledgeSchema.safeParse(body);
    if (!parsed.success) {
      sendJson(response, 400, { error: '知识库内容不完整。' });
      return;
    }
    const updated = await store.updateKnowledgeItem(knowledgeMatch[1], parsed.data);
    sendJson(response, updated ? 200 : 404, updated || { error: '没有找到这条知识。' });
    return;
  }

  if (knowledgeMatch && request.method === 'DELETE') {
    const deleted = await store.deleteKnowledgeItem(knowledgeMatch[1]);
    sendJson(response, deleted ? 200 : 404, { deleted });
    return;
  }

  if (url.pathname === '/api/ask' && request.method === 'POST') {
    const body = await readJsonBody(request);
    const parsed = askSchema.safeParse(body);
    if (!parsed.success) {
      sendJson(response, 400, { error: '请输入问题。' });
      return;
    }
    const result = await answerService.answer(parsed.data.question, { source: 'dashboard' });
    sendJson(response, 200, result);
    return;
  }

  if (url.pathname === '/api/conversations' && request.method === 'GET') {
    const limit = Number.parseInt(url.searchParams.get('limit') || '50', 10);
    sendJson(response, 200, await store.listConversationLogs({ limit: clamp(limit, 1, 200) }));
    return;
  }

  if (url.pathname === '/api/growth/scripts' && request.method === 'GET') {
    sendJson(response, 200, await store.listGrowthScripts());
    return;
  }

  if (url.pathname === '/api/growth/scripts' && request.method === 'POST') {
    const parsed = growthScriptSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '引流话术不完整。' });
      return;
    }
    sendJson(response, 201, await store.createGrowthScript(parsed.data));
    return;
  }

  if (url.pathname === '/api/growth/materials' && request.method === 'GET') {
    sendJson(response, 200, await store.listGrowthMaterials());
    return;
  }

  if (url.pathname === '/api/growth/materials' && request.method === 'POST') {
    const parsed = growthMaterialSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '引流素材不完整。' });
      return;
    }
    sendJson(response, 201, await store.createGrowthMaterial(parsed.data));
    return;
  }

  if (url.pathname === '/api/growth/rules' && request.method === 'GET') {
    sendJson(response, 200, await store.listGrowthRules());
    return;
  }

  if (url.pathname === '/api/growth/rules' && request.method === 'POST') {
    const parsed = growthRuleSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '引流规则不完整。' });
      return;
    }
    sendJson(response, 201, await store.createGrowthRule(parsed.data));
    return;
  }

  if (url.pathname === '/api/growth/leads' && request.method === 'GET') {
    const limit = Number.parseInt(url.searchParams.get('limit') || '100', 10);
    sendJson(response, 200, await store.listGrowthLeads({ limit: clamp(limit, 1, 300) }));
    return;
  }

  if (url.pathname === '/api/hermes/commands' && request.method === 'GET') {
    const limit = Number.parseInt(url.searchParams.get('limit') || '50', 10);
    sendJson(response, 200, await store.listHermesCommands({ limit: clamp(limit, 1, 100) }));
    return;
  }

  if (url.pathname === '/api/hermes/commands' && request.method === 'POST') {
    const parsed = hermesCommandSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '请输入 Hermes 指令内容。' });
      return;
    }
    sendJson(response, 201, await store.createHermesCommand(buildHermesCommandPayload(parsed.data)));
    return;
  }

  if (url.pathname === '/api/hermes/blocker-report' && request.method === 'POST') {
    const parsed = hermesBlockerReportSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '请输入阻塞模块、缺少资料和下一步动作。' });
      return;
    }
    const missing = normalizeStringList(parsed.data.missing);
    const text = [
      `${parsed.data.title}：当前模块 ${parsed.data.moduleId}${parsed.data.taskId ? ` / ${parsed.data.taskId}` : ''} 需要用户协助。`,
      `缺少资料：${missing.join('、') || '暂无明确资料名称'}`,
      `下一步：${parsed.data.nextStep}`
    ].join('\n');
    const command = await store.createHermesCommand(
      buildHermesCommandPayload({
        source: 'codex',
        sender: 'codex',
        priority: 'high',
        direction: 'outbound',
        type: 'blocker',
        target: 'apple',
        moduleId: parsed.data.moduleId,
        taskId: parsed.data.taskId,
        text
      })
    );
    sendJson(response, 201, command);
    return;
  }

  const hermesCommandMatch = url.pathname.match(/^\/api\/hermes\/commands\/([^/]+)$/);
  if (hermesCommandMatch && request.method === 'PUT') {
    const parsed = hermesCommandStatusSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '请选择有效的指令状态。' });
      return;
    }
    const updated = await store.updateHermesCommand(hermesCommandMatch[1], parsed.data);
    sendJson(response, updated ? 200 : 404, updated || { error: '没有找到这条 Hermes 指令。' });
    return;
  }

  if (url.pathname === '/api/growth/generate' && request.method === 'POST') {
    const parsed = growthGenerateSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) {
      sendJson(response, 400, { error: '请输入客户消息和平台。' });
      return;
    }

    const result = generateGrowthReply({
      ...parsed.data,
      rules: await store.listGrowthRules(),
      scripts: await store.listGrowthScripts(),
      materials: await store.listGrowthMaterials()
    });

    let lead = null;
    if (result.allowed) {
      lead = await store.createGrowthLead({
        platform: parsed.data.platform,
        customerName: parsed.data.customerName,
        message: parsed.data.message,
        score: result.lead.score,
        level: result.lead.level,
        signals: result.lead.signals,
        suggestedReply: result.reply,
        requiresHumanApproval: result.requiresHumanApproval
      });
    }

    sendJson(response, result.allowed ? 200 : 409, { ...result, lead });
    return;
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    await serveStatic(url.pathname, response, { headOnly: request.method === 'HEAD' });
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      throw new Error('request body is too large');
    }
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function serveStatic(pathname, response, { headOnly = false } = {}) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = normalize(join(publicDir, safePath));
  if (!filePath.startsWith(publicDir)) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }

  try {
    await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentType(filePath),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    if (headOnly) {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch {
    sendJson(response, 404, { error: 'Not found' });
  }
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(data));
}

function contentType(filePath) {
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml; charset=utf-8'
  };
  return types[extname(filePath)] || 'application/octet-stream';
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

function buildPrivateMessageKnowledgeQuery(input) {
  return [
    input.platform,
    input.postPlatform,
    input.postLocation,
    input.postTitle,
    input.commentText,
    input.contentRelation,
    input.sentiment,
    input.needOwner,
    input.solution,
    input.offer,
    '私信 开场 资料 引流 客服 进群 信任 核验'
  ]
    .filter(Boolean)
    .join(' ');
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(/[,，\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function resolveServerEnv(env, envPath) {
  const fileEnv = await readPlatformConfigEnv(envPath);
  const merged = { ...fileEnv };
  for (const [key, value] of Object.entries(env || {})) {
    if (String(value || '').trim()) {
      merged[key] = value;
    }
  }
  return merged;
}
