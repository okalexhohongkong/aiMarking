import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { nanoid } from 'nanoid';
import { defaultGrowthData, defaultKnowledgeItems } from './seedContent.js';

export class JsonDataStore {
  constructor({ dataDir = join(process.cwd(), 'data'), now = () => new Date() } = {}) {
    this.dataDir = dataDir;
    this.now = now;
    this.knowledgePath = join(dataDir, 'knowledge.json');
    this.conversationsPath = join(dataDir, 'conversations.json');
    this.growthPath = join(dataDir, 'growth.json');
    this.hermesCommandsPath = join(dataDir, 'hermesCommands.json');
    this.privateMessageApprovalsPath = join(dataDir, 'privateMessageApprovals.json');
  }

  async init() {
    await mkdir(this.dataDir, { recursive: true });
    await ensureJsonFile(this.knowledgePath, defaultKnowledgeItems(this.now()));
    await ensureJsonFile(this.conversationsPath, []);
    await ensureJsonFile(this.growthPath, defaultGrowthData(this.now()));
    await ensureJsonFile(this.hermesCommandsPath, []);
    await ensureJsonFile(this.privateMessageApprovalsPath, []);
  }

  async listKnowledgeItems() {
    const items = await readJson(this.knowledgePath, []);
    return items.map(normalizeKnowledgeItem).toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async createKnowledgeItem(input) {
    const now = this.now().toISOString();
    const item = {
      id: nanoid(),
      title: input.title.trim(),
      content: input.content.trim(),
      tags: normalizeTags(input.tags),
      category: normalizeText(input.category),
      scenarios: normalizeList(input.scenarios),
      concepts: normalizeList(input.concepts),
      steps: normalizeList(input.steps),
      createdAt: now,
      updatedAt: now
    };

    const items = await readJson(this.knowledgePath, []);
    items.push(item);
    await writeJsonAtomic(this.knowledgePath, items);
    return item;
  }

  async updateKnowledgeItem(id, input) {
    const items = await readJson(this.knowledgePath, []);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    const updated = {
      ...items[index],
      title: input.title.trim(),
      content: input.content.trim(),
      tags: normalizeTags(input.tags),
      category: normalizeText(input.category),
      scenarios: normalizeList(input.scenarios),
      concepts: normalizeList(input.concepts),
      steps: normalizeList(input.steps),
      updatedAt: this.now().toISOString()
    };

    items[index] = updated;
    await writeJsonAtomic(this.knowledgePath, items);
    return updated;
  }

  async deleteKnowledgeItem(id) {
    const items = await readJson(this.knowledgePath, []);
    const filtered = items.filter((item) => item.id !== id);
    await writeJsonAtomic(this.knowledgePath, filtered);
    return filtered.length !== items.length;
  }

  async createConversationLog(input) {
    const log = {
      id: nanoid(),
      question: input.question,
      answer: input.answer,
      source: input.source || 'unknown',
      sender: input.sender || null,
      roomId: input.roomId || null,
      matchedKnowledgeIds: input.matchedKnowledgeIds || [],
      usedFallback: Boolean(input.usedFallback),
      createdAt: this.now().toISOString()
    };

    const logs = await readJson(this.conversationsPath, []);
    logs.push(log);
    await writeJsonAtomic(this.conversationsPath, logs.slice(-1000));
    return log;
  }

  async listConversationLogs({ limit = 50 } = {}) {
    const logs = await readJson(this.conversationsPath, []);
    return logs.toReversed().slice(0, limit);
  }

  async listGrowthScripts() {
    const data = await readGrowthData(this.growthPath);
    return data.scripts.toReversed();
  }

  async createGrowthScript(input) {
    const data = await readGrowthData(this.growthPath);
    const item = {
      id: nanoid(),
      scene: normalizeText(input.scene),
      customerStage: normalizeText(input.customerStage),
      painPoint: normalizeText(input.painPoint),
      tone: normalizeText(input.tone),
      goal: normalizeText(input.goal),
      template: normalizeText(input.template),
      createdAt: this.now().toISOString()
    };
    data.scripts.push(item);
    await writeJsonAtomic(this.growthPath, data);
    return item;
  }

  async listGrowthMaterials() {
    const data = await readGrowthData(this.growthPath);
    return data.materials.toReversed();
  }

  async createGrowthMaterial(input) {
    const data = await readGrowthData(this.growthPath);
    const item = {
      id: nanoid(),
      name: normalizeText(input.name),
      type: normalizeText(input.type),
      description: normalizeText(input.description),
      cta: normalizeText(input.cta),
      createdAt: this.now().toISOString()
    };
    data.materials.push(item);
    await writeJsonAtomic(this.growthPath, data);
    return item;
  }

  async listGrowthRules() {
    const data = await readGrowthData(this.growthPath);
    return data.rules.toReversed();
  }

  async createGrowthRule(input) {
    const data = await readGrowthData(this.growthPath);
    const item = {
      id: nanoid(),
      name: normalizeText(input.name),
      keywords: normalizeList(input.keywords),
      scene: normalizeText(input.scene),
      enabled: input.enabled !== false,
      createdAt: this.now().toISOString()
    };
    data.rules.push(item);
    await writeJsonAtomic(this.growthPath, data);
    return item;
  }

  async createGrowthLead(input) {
    const data = await readGrowthData(this.growthPath);
    const lead = {
      id: nanoid(),
      platform: normalizeText(input.platform),
      customerName: normalizeText(input.customerName),
      message: normalizeText(input.message),
      score: Number(input.score || 0),
      level: normalizeText(input.level),
      signals: normalizeList(input.signals),
      suggestedReply: normalizeText(input.suggestedReply),
      requiresHumanApproval: input.requiresHumanApproval !== false,
      createdAt: this.now().toISOString()
    };
    data.leads.push(lead);
    data.leads = data.leads.slice(-1000);
    await writeJsonAtomic(this.growthPath, data);
    return lead;
  }

  async listGrowthLeads({ limit = 100 } = {}) {
    const data = await readGrowthData(this.growthPath);
    return data.leads.toReversed().slice(0, limit);
  }

  async createHermesCommand(input) {
    const commands = await readJson(this.hermesCommandsPath, []);
    const command = {
      id: nanoid(),
      source: normalizeText(input.source) || 'hermes',
      sender: normalizeText(input.sender),
      text: normalizeText(input.text),
      status: normalizeCommandStatus(input.status),
      priority: normalizeText(input.priority) || 'normal',
      direction: normalizeCommandDirection(input.direction),
      type: normalizeHermesType(input.type),
      target: normalizeText(input.target) || defaultHermesTarget(input.direction),
      moduleId: normalizeText(input.moduleId),
      taskId: normalizeText(input.taskId),
      createdAt: this.now().toISOString(),
      updatedAt: this.now().toISOString()
    };
    commands.push(command);
    await writeJsonAtomic(this.hermesCommandsPath, commands.slice(-500));
    return command;
  }

  async listHermesCommands({ limit = 50 } = {}) {
    const commands = await readJson(this.hermesCommandsPath, []);
    return commands.toReversed().slice(0, limit).map(normalizeHermesCommand);
  }

  async updateHermesCommand(id, input) {
    const commands = await readJson(this.hermesCommandsPath, []);
    const index = commands.findIndex((command) => command.id === id);
    if (index === -1) {
      return null;
    }

    const updated = {
      ...normalizeHermesCommand(commands[index]),
      status: normalizeCommandStatus(input.status || commands[index].status),
      updatedAt: this.now().toISOString()
    };
    commands[index] = updated;
    await writeJsonAtomic(this.hermesCommandsPath, commands);
    return updated;
  }

  async createPrivateMessageApproval(input) {
    const approvals = await readJson(this.privateMessageApprovalsPath, []);
    const now = this.now().toISOString();
    const approval = normalizePrivateMessageApproval({
      id: nanoid(),
      platform: redactSensitiveText(input.platform),
      customerName: redactSensitiveText(input.customerName),
      message: redactSensitiveText(input.message),
      sourceTrace: redactSensitiveText(input.sourceTrace),
      sendReadiness: redactSensitiveText(input.sendReadiness),
      invitationTarget: redactSensitiveText(input.invitationTarget),
      riskNotes: redactSensitiveText(input.riskNotes),
      reviewerNote: redactSensitiveText(input.reviewerNote),
      createdBy: redactSensitiveText(input.createdBy) || 'dashboard',
      status: normalizeApprovalStatus(input.status),
      createdAt: now,
      updatedAt: now
    });
    approvals.push(approval);
    await writeJsonAtomic(this.privateMessageApprovalsPath, approvals.slice(-500));
    return approval;
  }

  async listPrivateMessageApprovals({ limit = 50 } = {}) {
    const approvals = await readJson(this.privateMessageApprovalsPath, []);
    return approvals.toReversed().slice(0, limit).map(normalizePrivateMessageApproval);
  }

  async updatePrivateMessageApproval(id, input) {
    const approvals = await readJson(this.privateMessageApprovalsPath, []);
    const index = approvals.findIndex((approval) => approval.id === id);
    if (index === -1) {
      return null;
    }

    const updated = normalizePrivateMessageApproval({
      ...approvals[index],
      status: normalizeApprovalStatus(input.status || approvals[index].status),
      reviewerNote: redactSensitiveText(input.reviewerNote ?? approvals[index].reviewerNote),
      updatedAt: this.now().toISOString()
    });
    approvals[index] = updated;
    await writeJsonAtomic(this.privateMessageApprovalsPath, approvals);
    return updated;
  }
}

function normalizeKnowledgeItem(item) {
  return {
    ...item,
    tags: normalizeList(item.tags),
    category: normalizeText(item.category),
    scenarios: normalizeList(item.scenarios),
    concepts: normalizeList(item.concepts),
    steps: normalizeList(item.steps)
  };
}

function normalizeTags(tags = []) {
  return normalizeList(tags);
}

function normalizeList(value = []) {
  if (typeof value === 'string') {
    return value
      .split(/[,，\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeHermesCommand(command) {
  return {
    ...command,
    source: normalizeText(command.source) || 'hermes',
    sender: normalizeText(command.sender),
    text: normalizeText(command.text),
    status: normalizeCommandStatus(command.status),
    priority: normalizeText(command.priority) || 'normal',
    direction: normalizeCommandDirection(command.direction),
    type: normalizeHermesType(command.type),
    target: normalizeText(command.target) || defaultHermesTarget(command.direction),
    moduleId: normalizeText(command.moduleId),
    taskId: normalizeText(command.taskId)
  };
}

function normalizePrivateMessageApproval(approval) {
  return {
    ...approval,
    platform: redactSensitiveText(approval.platform),
    customerName: redactSensitiveText(approval.customerName),
    message: redactSensitiveText(approval.message),
    sourceTrace: redactSensitiveText(approval.sourceTrace),
    sendReadiness: redactSensitiveText(approval.sendReadiness),
    invitationTarget: redactSensitiveText(approval.invitationTarget),
    riskNotes: redactSensitiveText(approval.riskNotes),
    reviewerNote: redactSensitiveText(approval.reviewerNote),
    createdBy: redactSensitiveText(approval.createdBy) || 'dashboard',
    status: normalizeApprovalStatus(approval.status)
  };
}

function normalizeCommandStatus(status) {
  const normalized = normalizeText(status);
  return ['new', 'accepted', 'done', 'ignored'].includes(normalized) ? normalized : 'new';
}

function normalizeCommandDirection(direction) {
  const normalized = normalizeText(direction);
  return ['inbound', 'outbound'].includes(normalized) ? normalized : 'inbound';
}

function normalizeHermesType(type) {
  const normalized = normalizeText(type);
  return ['task', 'blocker', 'progress', 'split', 'merge'].includes(normalized) ? normalized : 'task';
}

function normalizeApprovalStatus(status) {
  const normalized = normalizeText(status);
  return ['pending', 'approved', 'rejected', 'sent', 'archived'].includes(normalized) ? normalized : 'pending';
}

function redactSensitiveText(value) {
  return normalizeText(value)
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, '[已脱敏]')
    .replace(/\b(api[_-]?key|secret|token|password)\s*[:=]\s*\S+/gi, '[已脱敏]');
}

function defaultHermesTarget(direction) {
  return normalizeCommandDirection(direction) === 'outbound' ? 'apple' : 'codex';
}

async function ensureJsonFile(filePath, fallback) {
  try {
    await readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    await writeJsonAtomic(filePath, fallback);
  }
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

async function readGrowthData(filePath) {
  const data = await readJson(filePath, defaultGrowthData());
  return {
    scripts: Array.isArray(data.scripts) ? data.scripts : [],
    materials: Array.isArray(data.materials) ? data.materials : [],
    rules: Array.isArray(data.rules) ? data.rules : [],
    leads: Array.isArray(data.leads) ? data.leads : []
  };
}

async function writeJsonAtomic(filePath, data) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await rename(tempPath, filePath);
}
