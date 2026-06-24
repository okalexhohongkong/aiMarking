import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { JsonDataStore } from '../src/dataStore.js';

test('creates, lists, updates, and deletes knowledge items', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-store-'));
  try {
    const store = new JsonDataStore({ dataDir: dir });
    await store.init();

    const item = await store.createKnowledgeItem({
      title: '安装资料',
      content: '安装需要营业执照和联系人手机号。',
      tags: ['安装', '合同'],
      category: '售前',
      scenarios: '新客户安装, 签合同',
      concepts: '营业执照, 联系人',
      steps: '准备营业执照\n确认联系人手机号'
    });

    assert.equal(item.title, '安装资料');
    assert.ok(item.id);

    const all = await store.listKnowledgeItems();
    const created = all.find((entry) => entry.id === item.id);
    assert.ok(created);
    assert.deepEqual(created.tags, ['安装', '合同']);
    assert.equal(created.category, '售前');
    assert.deepEqual(created.scenarios, ['新客户安装', '签合同']);
    assert.deepEqual(created.concepts, ['营业执照', '联系人']);
    assert.deepEqual(created.steps, ['准备营业执照', '确认联系人手机号']);

    const updated = await store.updateKnowledgeItem(item.id, {
      title: '安装资料更新',
      content: '安装需要营业执照、联系人手机号和开票信息。',
      tags: ['安装'],
      category: '售后',
      scenarios: ['补资料'],
      concepts: ['开票信息'],
      steps: ['补充开票信息']
    });
    assert.equal(updated.title, '安装资料更新');
    assert.equal(updated.category, '售后');

    await store.deleteKnowledgeItem(item.id);
    assert.equal((await store.listKnowledgeItems()).some((entry) => entry.id === item.id), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('records conversation logs newest first', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-store-'));
  try {
    const store = new JsonDataStore({ dataDir: dir });
    await store.init();

    await store.createConversationLog({
      question: '问题一',
      answer: '答案一',
      source: 'dashboard',
      matchedKnowledgeIds: []
    });
    await store.createConversationLog({
      question: '问题二',
      answer: '答案二',
      source: 'wecom',
      matchedKnowledgeIds: ['k1']
    });

    const logs = await store.listConversationLogs({ limit: 10 });
    assert.equal(logs.length, 2);
    assert.equal(logs[0].question, '问题二');
    assert.equal(logs[1].question, '问题一');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('stores growth scripts, materials, rules, and leads', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-store-'));
  try {
    const store = new JsonDataStore({ dataDir: dir });
    await store.init();

    const script = await store.createGrowthScript({
      scene: '选型',
      customerStage: '陌生',
      painPoint: '选择困难',
      tone: '顾问',
      goal: '加企微',
      template: '我可以发你一份{material}。'
    });
    const material = await store.createGrowthMaterial({
      name: '选型表',
      type: '表格',
      description: '帮客户选择型号',
      cta: '回复资料领取'
    });
    const rule = await store.createGrowthRule({
      name: '价格咨询',
      keywords: '多少钱, 价格',
      scene: '报价',
      enabled: true
    });
    const lead = await store.createGrowthLead({
      platform: '企业微信',
      customerName: '客户A',
      message: '多少钱',
      score: 80,
      level: '高意向',
      signals: ['价格咨询'],
      suggestedReply: '我发你价格表。'
    });

    assert.equal((await store.listGrowthScripts())[0].id, script.id);
    assert.equal((await store.listGrowthMaterials())[0].id, material.id);
    assert.equal((await store.listGrowthRules())[0].id, rule.id);
    assert.equal((await store.listGrowthLeads())[0].id, lead.id);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('stores Hermes reverse commands newest first and updates status', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-store-'));
  try {
    const store = new JsonDataStore({ dataDir: dir });
    await store.init();

    const first = await store.createHermesCommand({
      source: 'weixin',
      sender: 'apple',
      text: '继续开发跨平台接口',
      priority: 'high',
      direction: 'inbound',
      type: 'task',
      target: 'codex',
      moduleId: 'platforms',
      taskId: 'platforms-douyin'
    });
    const second = await store.createHermesCommand({
      source: 'feishu',
      sender: 'apple',
      text: '把私信生成器接进后台',
      direction: 'outbound',
      type: 'blocker',
      target: 'apple'
    });

    const commands = await store.listHermesCommands();
    assert.equal(commands.length, 2);
    assert.equal(commands[0].id, second.id);
    assert.equal(commands[1].id, first.id);
    assert.equal(commands[1].status, 'new');
    assert.equal(commands[1].priority, 'high');
    assert.equal(commands[1].direction, 'inbound');
    assert.equal(commands[1].type, 'task');
    assert.equal(commands[1].target, 'codex');
    assert.equal(commands[1].moduleId, 'platforms');
    assert.equal(commands[1].taskId, 'platforms-douyin');
    assert.equal(commands[0].direction, 'outbound');
    assert.equal(commands[0].type, 'blocker');
    assert.equal(commands[0].target, 'apple');

    const updated = await store.updateHermesCommand(first.id, { status: 'accepted' });
    assert.equal(updated.status, 'accepted');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('stores private message approvals and updates review status', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-store-'));
  try {
    const store = new JsonDataStore({ dataDir: dir });
    await store.init();

    const first = await store.createPrivateMessageApproval({
      platform: '抖音私信',
      customerName: '陈女士',
      message: '看到你在护理清单下面留言，我发你资料。',
      sourceTrace: '抖音公开作品留言',
      sendReadiness: '来源清楚，可人工确认后发送',
      invitationTarget: '抖音群',
      riskNotes: '涉及健康问题必须人工确认。secret=must-not-leak',
      createdBy: 'dashboard'
    });
    const second = await store.createPrivateMessageApproval({
      platform: 'WhatsApp',
      customerName: 'Tom',
      message: 'Need price list',
      sourceTrace: 'WhatsApp inbound',
      sendReadiness: '等待人工确认',
      invitationTarget: '平台内继续沟通',
      riskNotes: 'token=must-not-leak',
      createdBy: 'dashboard'
    });

    const approvals = await store.listPrivateMessageApprovals();
    assert.equal(approvals.length, 2);
    assert.equal(approvals[0].id, second.id);
    assert.equal(approvals[1].id, first.id);
    assert.equal(approvals[1].status, 'pending');
    assert.doesNotMatch(JSON.stringify(approvals), /must-not-leak|secret=|token=/i);

    const updated = await store.updatePrivateMessageApproval(first.id, {
      status: 'approved',
      reviewerNote: '话术合规，可以发送。password=must-not-leak'
    });
    assert.equal(updated.status, 'approved');
    assert.match(updated.reviewerNote, /话术合规/);
    assert.doesNotMatch(updated.reviewerNote, /password=|must-not-leak/i);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
