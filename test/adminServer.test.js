import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createAdminServer } from '../src/adminServer.js';
import { AnswerService } from '../src/answerService.js';
import { JsonDataStore } from '../src/dataStore.js';

test('admin API manages knowledge and answers questions', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();

  const answerService = new AnswerService({
    store,
    llmClient: {
      answer: async (question, context) => `答案：${question}\n${context.knowledgeContext}`
    }
  });

  const server = createAdminServer({
    store,
    answerService,
    configSummary: {
      botMentionName: '智能客服',
      knowledgeBaseName: '奥普C在知识库',
      openaiBaseUrl: 'http://127.0.0.1:3688/v1',
      hasWecomCredentials: false,
      hasOpenAiKey: true
    }
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const created = await requestJson(`${baseUrl}/api/knowledge`, {
      method: 'POST',
      body: {
        title: '合同资料',
        content: '合同签署需要营业执照。',
        tags: ['合同'],
        category: '售前',
        scenarios: ['签合同'],
        concepts: ['营业执照'],
        steps: ['准备营业执照']
      }
    });
    assert.equal(created.title, '合同资料');

    const items = await requestJson(`${baseUrl}/api/knowledge`);
    const createdItem = items.find((item) => item.id === created.id);
    assert.ok(createdItem);
    assert.equal(createdItem.category, '售前');

    const graph = await requestJson(`${baseUrl}/api/knowledge-graph`);
    assert.ok(graph.nodes.some((node) => node.id === `knowledge:${created.id}`));
    assert.ok(graph.edges.some((edge) => edge.type === 'mentions'));

    const answer = await requestJson(`${baseUrl}/api/ask`, {
      method: 'POST',
      body: { question: '合同怎么签？' }
    });
    assert.match(answer.answer, /合同签署需要营业执照/);
    assert.ok(answer.matches.some((match) => match.id === created.id));

    const logs = await requestJson(`${baseUrl}/api/conversations`);
    assert.equal(logs.length, 1);
    assert.equal(logs[0].source, 'dashboard');
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API rejects invalid knowledge input', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '', content: '' })
    });

    assert.equal(response.status, 400);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API manages private-domain growth 1.0 resources', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    await requestJson(`${baseUrl}/api/growth/scripts`, {
      method: 'POST',
      body: {
        scene: '选型',
        customerStage: '陌生',
        painPoint: '选择困难',
        tone: '顾问',
        goal: '加企微',
        template: '我可以发你一份{material}。'
      }
    });
    await requestJson(`${baseUrl}/api/growth/materials`, {
      method: 'POST',
      body: {
        name: '选型避坑清单',
        type: '资料',
        description: '帮助客户选型',
        cta: '回复“资料”领取'
      }
    });
    await requestJson(`${baseUrl}/api/growth/rules`, {
      method: 'POST',
      body: {
        name: '选型咨询',
        keywords: '怎么选',
        scene: '选型',
        enabled: true
      }
    });

    const generated = await requestJson(`${baseUrl}/api/growth/generate`, {
      method: 'POST',
      body: {
        platform: '企业微信',
        customerName: '客户A',
        message: '这个怎么选？',
        customerStage: '陌生',
        goal: '加企微',
        interactionCount: 2
      }
    });

    assert.match(generated.reply, /选型避坑清单/);
    assert.equal(generated.lead.level, '中意向');
    assert.equal((await requestJson(`${baseUrl}/api/growth/leads`)).length, 1);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API simulates a channel adapter message through the shared engine', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: {
      answer: async (question, context) => {
        assert.equal(question, '合同怎么签？');
        assert.equal(context.source, 'douyin');
        return { answer: `来自${context.channel}：请准备营业执照。` };
      }
    },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const result = await requestJson(`${baseUrl}/api/channels/douyin/simulate`, {
      method: 'POST',
      body: {
        openId: 'user-1',
        conversationId: 'conv-1',
        content: '合同怎么签？'
      }
    });

    assert.equal(result.replied, true);
    assert.match(result.reply, /请准备营业执照/);
    assert.equal(result.delivery.delivered, true);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exposes the seven-layer marketing system blueprint', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const blueprint = await requestJson(`http://127.0.0.1:${server.address().port}/api/marketing-system`);

    assert.equal(blueprint.name, '黑卫士七维AI营销系统');
    assert.equal(blueprint.modules.length, 7);
    assert.equal(blueprint.summary.total, 7);
    assert.ok(blueprint.compliancePrinciples.some((principle) => principle.includes('人工确认')));
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exposes customer lifecycle and engagement playbooks', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const lifecycle = await requestJson(`${baseUrl}/api/customer-lifecycle`);
    assert.equal(lifecycle.stages.length, 7);
    assert.ok(lifecycle.operatingPrinciples.some((item) => item.includes('价值交换')));
    assert.ok(lifecycle.compliancePrinciples.some((item) => item.includes('用户同意')));

    const playbooks = await requestJson(`${baseUrl}/api/engagement-playbooks`);
    assert.ok(playbooks.playbooks.some((playbook) => playbook.id === 'comment-one-time-private-message'));
    assert.ok(playbooks.complianceRules.some((rule) => rule.id === 'human-review'));
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API generates one-time private message context safely', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  await store.createKnowledgeItem({
    title: '儿童过敏护理知识库',
    content: '儿童过敏护理咨询先判断年龄、症状、触发环境和既往处理，再提供护理清单和下一步咨询入口。',
    tags: ['儿童过敏', '护理清单', '抖音私信'],
    category: '儿童健康',
    scenarios: ['抖音私信', '评论后一次性私信', '进群前资料领取'],
    concepts: ['儿童过敏', '护理清单', '长期护理'],
    steps: ['确认留言来源', '判断需求对象', '提供护理清单', '邀请到对应平台群继续交流']
  });
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const result = await requestJson(`${baseUrl}/api/private-message/generate`, {
      method: 'POST',
      body: {
        platform: '抖音私信',
        customerName: '陈女士',
        ipProvince: '广东',
        ipCity: '广州',
        postPlatform: '抖音',
        postLocation: '广州本地母婴账号',
        postTitle: '儿童过敏护理清单',
        postPublishedAt: '2026-06-20T10:00:00+08:00',
        commentedAt: '2026-06-22T21:00:00+08:00',
        commentText: '我想要资料，家里孩子最近反复过敏',
        contentRelation: '留言与作品里的护理清单直接相关',
        sentiment: 'positive',
        genderGuess: 'female',
        needOwner: '家人',
        solution: '儿童过敏护理咨询',
        offer: '护理清单和首次咨询优惠',
        officialSiteUrl: 'https://example.com/verify',
        groupInviteUrl: 'https://example.com/group',
        contactUrl: 'https://example.com/contact',
        companyVerification: '企业主体和资质可公开核验',
        secret: 'sk-this-value-must-not-leak'
      }
    });

    assert.match(result.message, /陈女士/);
    assert.match(result.contextSummary, /广东广州/);
    assert.match(result.sourceTrace, /抖音公开作品|公开互动/);
    assert.match(result.sendReadiness, /可发送一次性私信|来源清楚/);
    assert.match(result.signalAssessment, /广东广州/);
    assert.match(result.signalAssessment, /广州本地母婴账号/);
    assert.match(result.knowledgeRouting, /已命中|儿童过敏护理知识库/);
    assert.match(result.knowledgeFocus, /儿童过敏护理知识库/);
    assert.match(result.needHypothesis, /家人/);
    assert.match(result.verificationChecklist, /企查查|企业信用|官网/);
    assert.match(result.invitationTarget, /抖音群|平台群/);
    assert.match(result.invitationDecision, /抖音群|平台群/);
    assert.match(result.trustProof, /https:\/\/example\.com\/verify/);
    assert.match(result.primaryCta, /https:\/\/example\.com\/group/);
    assert.match(result.riskNotes, /人工确认/);
    assert.doesNotMatch(JSON.stringify(result), /sk-this-value-must-not-leak|secret=/i);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API queues generated private messages for human approval', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const queued = await requestJson(`${baseUrl}/api/private-message/approvals`, {
      method: 'POST',
      body: {
        platform: '抖音私信',
        customerName: '陈女士',
        message: '看到你在护理清单下面留言，我发你资料。',
        sourceTrace: '抖音公开作品留言',
        sendReadiness: '来源清楚，可人工确认后发送',
        invitationTarget: '抖音群',
        riskNotes: '涉及健康问题必须人工确认。api_key=must-not-leak'
      }
    });

    assert.equal(queued.status, 'pending');
    assert.equal(queued.platform, '抖音私信');
    assert.doesNotMatch(JSON.stringify(queued), /api_key=|must-not-leak/i);

    const approvals = await requestJson(`${baseUrl}/api/private-message/approvals`);
    assert.equal(approvals[0].id, queued.id);

    const approved = await requestJson(`${baseUrl}/api/private-message/approvals/${queued.id}`, {
      method: 'PUT',
      body: {
        status: 'approved',
        reviewerNote: '客服主管已确认，可以发送。token=must-not-leak'
      }
    });
    assert.equal(approved.status, 'approved');
    assert.match(approved.reviewerNote, /客服主管已确认/);
    assert.doesNotMatch(approved.reviewerNote, /token=|must-not-leak/i);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exports a knowledge import template', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const localOperations = {
    getDataStatus: async () => ({ counts: {}, latestBackup: null, admin: {} }),
    createBackup: async () => ({ path: '/tmp/backup-1', files: [] }),
    exportKnowledge: async () => ({ path: '/tmp/knowledge.json', itemCount: 0 }),
    exportKnowledgeTemplate: async () => ({
      name: 'knowledge-import-template.json',
      path: '/tmp/knowledge-import-template.json',
      itemCount: 2
    })
  };
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {},
    localOperations
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const exported = await requestJson(`http://127.0.0.1:${server.address().port}/api/local/export-knowledge-template`, {
      method: 'POST'
    });

    assert.equal(exported.name, 'knowledge-import-template.json');
    assert.equal(exported.itemCount, 2);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exposes local operations for the dashboard', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const localOperations = {
    getDataStatus: async () => ({
      counts: { knowledge: 14, conversations: 3, growthLeads: 0 },
      latestBackup: null,
      admin: { url: 'http://127.0.0.1:8787', processAlive: true, httpOk: true }
    }),
    createBackup: async () => ({ path: '/tmp/backup-1', files: ['knowledge.json'] }),
    exportKnowledge: async () => ({ path: '/tmp/knowledge.json', itemCount: 14 })
  };
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {},
    localOperations
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const status = await requestJson(`${baseUrl}/api/local/status`);
    assert.equal(status.counts.knowledge, 14);
    assert.equal(status.admin.httpOk, true);

    const backup = await requestJson(`${baseUrl}/api/local/backup`, { method: 'POST' });
    assert.equal(backup.path, '/tmp/backup-1');

    const exported = await requestJson(`${baseUrl}/api/local/export-knowledge`, { method: 'POST' });
    assert.equal(exported.itemCount, 14);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API receives Hermes reverse commands', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const created = await requestJson(`${baseUrl}/api/hermes/commands`, {
      method: 'POST',
      body: {
        source: 'weixin',
        sender: 'apple',
        text: '把私信生成器接进后台',
        priority: 'high',
        direction: 'inbound',
        type: 'task',
        target: 'codex',
        moduleId: 'private-message',
        taskId: 'private-message-approval'
      }
    });
    assert.equal(created.status, 'new');
    assert.equal(created.source, 'weixin');
    assert.equal(created.priority, 'high');
    assert.equal(created.direction, 'inbound');
    assert.equal(created.type, 'task');
    assert.equal(created.target, 'codex');
    assert.equal(created.moduleId, 'private-message');
    assert.equal(created.taskId, 'private-message-approval');

    const commands = await requestJson(`${baseUrl}/api/hermes/commands`);
    assert.equal(commands[0].id, created.id);

    const updated = await requestJson(`${baseUrl}/api/hermes/commands/${created.id}`, {
      method: 'PUT',
      body: { status: 'accepted' }
    });
    assert.equal(updated.status, 'accepted');

    const blocker = await requestJson(`${baseUrl}/api/hermes/blocker-report`, {
      method: 'POST',
      body: {
        moduleId: 'platforms',
        taskId: 'platforms-wecom',
        title: '企业微信接入卡住',
        missing: ['WECOM_BOT_ID', 'WECOM_BOT_SECRET'],
        nextStep: '请通过 Hermes 回复企业微信机器人凭证'
      }
    });
    assert.equal(blocker.direction, 'outbound');
    assert.equal(blocker.type, 'blocker');
    assert.equal(blocker.target, 'apple');
    assert.match(blocker.text, /企业微信接入卡住/);
    assert.match(blocker.text, /WECOM_BOT_ID/);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exposes orchestration plan for parallel module work', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const plan = await requestJson(`http://127.0.0.1:${server.address().port}/api/orchestration-plan`);

    assert.equal(plan.workstreams.length, 4);
    assert.equal(plan.summary.parallelSlots, 4);
    assert.ok(plan.workstreams.some((item) => item.needsResplit));
    assert.equal(plan.hermes.directionPolicy.outbound.includes('回传'), true);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exposes project progress without leaking credentials', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const progress = await requestJson(`http://127.0.0.1:${server.address().port}/api/project-progress`);
    const serialized = JSON.stringify(progress);

    assert.ok(progress.modules.some((module) => module.id === 'channels'));
    assert.ok(progress.modules.every((module) => module.percentText.endsWith('%')));
    assert.equal(serialized.includes('WECOM_BOT_SECRET'), false);
    assert.equal(serialized.includes('DOUYIN_APP_SECRET'), false);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exposes integration roadmap without leaking secret values', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: dir });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const roadmap = await requestJson(`http://127.0.0.1:${server.address().port}/api/integration-roadmap`);
    const serialized = JSON.stringify(roadmap);

    assert.equal(roadmap.steps[0].id, 'wecom');
    assert.equal(roadmap.steps[1].id, 'douyin');
    assert.ok(roadmap.steps.every((step) => step.percentText.endsWith('%')));
    assert.equal(serialized.includes('secret-value'), false);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exposes wecom readiness without leaking secret values', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const envPath = join(dir, '.env');
  await writeFile(
    envPath,
    [
      'WECOM_BOT_ID="bot-001"',
      'WECOM_BOT_SECRET="real-secret-value"',
      'OPENAI_API_KEY="openai-secret-value"',
      'BOT_MENTION_NAME="黑卫士"'
    ].join('\n'),
    'utf8'
  );
  const store = new JsonDataStore({ dataDir: join(dir, 'data') });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {},
    platformConfigEnvPath: envPath,
    env: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const readiness = await requestJson(`http://127.0.0.1:${server.address().port}/api/wecom/readiness`);
    const serialized = JSON.stringify(readiness);

    assert.equal(readiness.ready, true);
    assert.equal(readiness.percentText, '100.0%');
    assert.match(readiness.groupTest.triggerText, /@黑卫士/);
    assert.equal(serialized.includes('real-secret-value'), false);
    assert.equal(serialized.includes('openai-secret-value'), false);
    assert.equal(serialized.includes('bot-001'), false);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exposes douyin readiness without leaking secret values', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const envPath = join(dir, '.env');
  await writeFile(
    envPath,
    [
      'DOUYIN_APP_ID="douyin-001"',
      'DOUYIN_APP_SECRET="douyin-secret-value"',
      'OPENAI_API_KEY="openai-secret-value"'
    ].join('\n'),
    'utf8'
  );
  const store = new JsonDataStore({ dataDir: join(dir, 'data') });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {},
    platformConfigEnvPath: envPath,
    env: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const readiness = await requestJson(`http://127.0.0.1:${server.address().port}/api/douyin/readiness`);
    const serialized = JSON.stringify(readiness);

    assert.equal(readiness.ready, true);
    assert.equal(readiness.percentText, '100.0%');
    assert.match(readiness.groupTest.triggerText, /客户私信/);
    assert.equal(serialized.includes('douyin-001'), false);
    assert.equal(serialized.includes('douyin-secret-value'), false);
    assert.equal(serialized.includes('openai-secret-value'), false);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API exposes personal wechat readiness without leaking secret values', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const envPath = join(dir, '.env');
  await writeFile(
    envPath,
    [
      'EASYCLAW_BASE_URL="http://127.0.0.1:10027"',
      'EASYCLAW_ACCESS_TOKEN="easyclaw-secret-value"',
      'OPENAI_API_KEY="openai-secret-value"'
    ].join('\n'),
    'utf8'
  );
  const store = new JsonDataStore({ dataDir: join(dir, 'data') });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {},
    platformConfigEnvPath: envPath,
    env: {}
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const readiness = await requestJson(`http://127.0.0.1:${server.address().port}/api/wechat-personal/readiness`);
    const serialized = JSON.stringify(readiness);

    assert.equal(readiness.ready, true);
    assert.equal(readiness.percentText, '100.0%');
    assert.match(readiness.groupTest.triggerText, /客户微信/);
    assert.equal(serialized.includes('easyclaw-secret-value'), false);
    assert.equal(serialized.includes('openai-secret-value'), false);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API saves platform config without returning secret values', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: join(dir, 'data') });
  await store.init();
  const envPath = join(dir, '.env');
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {},
    platformConfigEnvPath: envPath
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const before = await requestJson(`${baseUrl}/api/platform-config`);
    assert.ok(before.sections.some((section) => section.id === 'wecom'));
    assert.equal(JSON.stringify(before).includes('real-secret-value'), false);

    const saved = await requestJson(`${baseUrl}/api/platform-config`, {
      method: 'POST',
      body: {
        sectionId: 'wecom',
        values: {
          WECOM_BOT_ID: 'bot-001',
          WECOM_BOT_SECRET: 'real-secret-value'
        }
      }
    });
    const serialized = JSON.stringify(saved);
    const wecom = saved.config.sections.find((section) => section.id === 'wecom');
    const secretField = wecom.fields.find((field) => field.key === 'WECOM_BOT_SECRET');

    assert.equal(wecom.missingRequired.length, 0);
    assert.equal(secretField.configured, true);
    assert.equal(secretField.sensitive, true);
    assert.equal(serialized.includes('real-secret-value'), false);
    assert.equal(serialized.includes('bot-001'), false);

    const envContent = await readFile(envPath, 'utf8');
    assert.match(envContent, /WECOM_BOT_ID="bot-001"/);
    assert.match(envContent, /WECOM_BOT_SECRET="real-secret-value"/);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('admin API rejects unknown platform config keys', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-admin-'));
  const store = new JsonDataStore({ dataDir: join(dir, 'data') });
  await store.init();
  const server = createAdminServer({
    store,
    answerService: { answer: async () => ({ answer: '', matches: [] }) },
    configSummary: {},
    platformConfigEnvPath: join(dir, '.env')
  });

  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/platform-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionId: 'wecom',
        values: {
          UNEXPECTED_SECRET: 'should-not-save'
        }
      })
    });

    const body = await response.json();
    assert.equal(response.status, 400);
    assert.match(body.error, /不允许/);
  } finally {
    server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  assert.equal(response.ok, true, text);
  return text ? JSON.parse(text) : null;
}
