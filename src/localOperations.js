import { copyFile, mkdir, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { closeSync, openSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { nanoid } from 'nanoid';

const dataFiles = ['knowledge.json', 'growth.json', 'conversations.json', 'hermesCommands.json', 'privateMessageApprovals.json'];

export class LocalOperations {
  constructor({
    projectDir = process.cwd(),
    now = () => new Date(),
    nodePath = process.execPath,
    fetchImpl = globalThis.fetch
  } = {}) {
    this.projectDir = projectDir;
    this.dataDir = join(projectDir, 'data');
    this.backupDir = join(projectDir, 'backups');
    this.exportDir = join(projectDir, 'exports');
    this.runtimeDir = join(projectDir, '.runtime');
    this.pidPath = join(this.runtimeDir, 'admin.pid');
    this.logPath = join(this.runtimeDir, 'admin.log');
    this.now = now;
    this.nodePath = nodePath;
    this.fetchImpl = fetchImpl;
  }

  async getDataStatus() {
    const [knowledge, growth, conversations, hermesCommands, privateMessageApprovals, backups, admin] = await Promise.all([
      readJson(join(this.dataDir, 'knowledge.json'), []),
      readJson(join(this.dataDir, 'growth.json'), {}),
      readJson(join(this.dataDir, 'conversations.json'), []),
      readJson(join(this.dataDir, 'hermesCommands.json'), []),
      readJson(join(this.dataDir, 'privateMessageApprovals.json'), []),
      this.listBackups(),
      this.getAdminRuntimeStatus()
    ]);

    return {
      projectDir: this.projectDir,
      dataDir: this.dataDir,
      counts: {
        knowledge: Array.isArray(knowledge) ? knowledge.length : 0,
        conversations: Array.isArray(conversations) ? conversations.length : 0,
        growthScripts: Array.isArray(growth.scripts) ? growth.scripts.length : 0,
        growthMaterials: Array.isArray(growth.materials) ? growth.materials.length : 0,
        growthRules: Array.isArray(growth.rules) ? growth.rules.length : 0,
        growthLeads: Array.isArray(growth.leads) ? growth.leads.length : 0,
        hermesCommands: Array.isArray(hermesCommands) ? hermesCommands.length : 0,
        privateMessageApprovals: Array.isArray(privateMessageApprovals) ? privateMessageApprovals.length : 0
      },
      files: await Promise.all(dataFiles.map((name) => inspectFile(join(this.dataDir, name), name))),
      latestBackup: backups.at(-1) || null,
      admin
    };
  }

  async createBackup({ label = '' } = {}) {
    await mkdir(this.backupDir, { recursive: true });
    const name = `backup-${formatDateForName(this.now())}${label ? `-${sanitizeLabel(label)}` : ''}`;
    const backupPath = join(this.backupDir, name);
    await mkdir(backupPath, { recursive: true });

    const copiedFiles = [];
    for (const fileName of dataFiles) {
      const source = join(this.dataDir, fileName);
      if (await exists(source)) {
        await copyFile(source, join(backupPath, fileName));
        copiedFiles.push(fileName);
      }
    }

    const manifest = {
      name,
      createdAt: this.now().toISOString(),
      projectDir: this.projectDir,
      files: copiedFiles
    };
    await writeJsonAtomic(join(backupPath, 'manifest.json'), manifest);

    return {
      ...manifest,
      path: backupPath
    };
  }

  async listBackups() {
    try {
      const names = await readdir(this.backupDir, { withFileTypes: true });
      return names
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('backup-'))
        .map((entry) => ({
          name: entry.name,
          path: join(this.backupDir, entry.name)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async restoreBackup(name) {
    const backups = await this.listBackups();
    const source = name ? backups.find((backup) => backup.name === name) : backups.at(-1);
    if (!source) {
      throw new Error('没有找到可恢复的备份。');
    }

    const safetyBackup = await this.createBackup({ label: 'before-restore' });
    await mkdir(this.dataDir, { recursive: true });

    const restoredFiles = [];
    for (const fileName of dataFiles) {
      const sourceFile = join(source.path, fileName);
      if (await exists(sourceFile)) {
        await copyFile(sourceFile, join(this.dataDir, fileName));
        restoredFiles.push(fileName);
      }
    }

    return {
      restoredFrom: source.name,
      restoredFiles,
      safetyBackup
    };
  }

  async importKnowledge(inputPath) {
    if (!inputPath) {
      throw new Error('请提供要导入的知识库文件路径。');
    }

    const payload = await readJson(resolve(this.projectDir, inputPath), null);
    const incomingItems = Array.isArray(payload) ? payload : payload?.items;
    if (!Array.isArray(incomingItems)) {
      throw new Error('知识库导入文件必须是数组，或包含 items 数组。');
    }

    await mkdir(this.dataDir, { recursive: true });
    const existingItems = await readJson(join(this.dataDir, 'knowledge.json'), []);
    const normalizedExisting = Array.isArray(existingItems) ? existingItems : [];
    const existingKeys = new Set(normalizedExisting.map((item) => knowledgeKey(item)));
    const now = this.now().toISOString();
    const imported = [];
    const skipped = [];

    for (const item of incomingItems) {
      const normalized = normalizeKnowledgeImportItem(item, now);
      if (!normalized.title || !normalized.content) {
        skipped.push({ title: normalized.title || '', reason: '缺少标题或内容' });
        continue;
      }
      const key = knowledgeKey(normalized);
      if (existingKeys.has(key)) {
        skipped.push({ title: normalized.title, reason: '标题重复' });
        continue;
      }
      existingKeys.add(key);
      imported.push(normalized);
    }

    await writeJsonAtomic(join(this.dataDir, 'knowledge.json'), [...normalizedExisting, ...imported]);

    return {
      importedCount: imported.length,
      skippedCount: skipped.length,
      skipped,
      totalCount: normalizedExisting.length + imported.length
    };
  }

  async exportKnowledge() {
    await mkdir(this.exportDir, { recursive: true });
    const items = await readJson(join(this.dataDir, 'knowledge.json'), []);
    const name = `knowledge-export-${formatDateForName(this.now())}.json`;
    const outputPath = join(this.exportDir, name);
    const payload = {
      exportedAt: this.now().toISOString(),
      itemCount: Array.isArray(items) ? items.length : 0,
      items: Array.isArray(items) ? items : []
    };

    await writeJsonAtomic(outputPath, payload);

    return {
      name,
      path: outputPath,
      itemCount: payload.itemCount
    };
  }

  async exportKnowledgeTemplate() {
    await mkdir(this.exportDir, { recursive: true });
    const name = `knowledge-import-template-${formatDateForName(this.now())}.json`;
    const outputPath = join(this.exportDir, name);
    const payload = {
      exportedAt: this.now().toISOString(),
      itemCount: 2,
      instructions: [
        '每条知识必须有 title 和 content。',
        'tags、scenarios、concepts、steps 可以写数组，也可以用逗号或换行分隔。',
        '导入前建议先备份数据，重复标题会自动跳过。'
      ],
      items: [
        {
          title: '示例：售前咨询接待流程',
          category: '售前',
          tags: ['首次咨询', '接待', '需求判断'],
          scenarios: ['新客户第一次咨询', '平台私信', '企业微信群提问'],
          concepts: ['客户需求', '预算', '下一步动作'],
          steps: ['回应客户问题', '确认使用场景', '判断意向等级', '给资料或转人工'],
          content: '这里填写标准回答、注意事项、不能承诺的边界和转人工条件。'
        },
        {
          title: '示例：售后问题处理流程',
          category: '售后',
          tags: ['售后', '投诉', '转人工'],
          scenarios: ['客户反馈问题', '客户不满意', '订单异常'],
          concepts: ['订单号', '问题截图', '处理时效'],
          steps: ['先安抚客户', '收集订单信息', '判断责任归属', '转人工处理'],
          content: '这里填写售后接待话术、资料收集要求、处理时效和平台规则。'
        }
      ]
    };

    await writeJsonAtomic(outputPath, payload);

    return {
      name,
      path: outputPath,
      itemCount: payload.itemCount
    };
  }

  async getAdminRuntimeStatus() {
    const pid = await readPid(this.pidPath);
    const processAlive = pid ? isProcessAlive(pid) : false;
    const url = await this.getAdminUrl();
    const httpOk = await this.pingAdmin(url);
    return {
      pid,
      processAlive,
      httpOk,
      url,
      logPath: this.logPath
    };
  }

  async startAdmin() {
    const current = await this.getAdminRuntimeStatus();
    if (current.processAlive) {
      return {
        started: false,
        alreadyRunning: true,
        ...current
      };
    }

    await mkdir(this.runtimeDir, { recursive: true });
    const logFd = openSync(this.logPath, 'a');
    let child;
    try {
      child = spawn(this.nodePath, ['src/admin.js'], {
        cwd: this.projectDir,
        detached: true,
        stdio: ['ignore', logFd, logFd],
        env: process.env
      });
    } finally {
      closeSync(logFd);
    }
    child.unref();
    await writeFile(this.pidPath, `${child.pid}\n`, 'utf8');

    const url = await this.getAdminUrl();
    const httpOk = await this.waitForAdmin(url);

    return {
      started: true,
      alreadyRunning: false,
      pid: child.pid,
      processAlive: isProcessAlive(child.pid),
      httpOk,
      url,
      logPath: this.logPath
    };
  }

  async stopAdmin() {
    const pid = await readPid(this.pidPath);
    if (!pid || !isProcessAlive(pid)) {
      await unlinkIfExists(this.pidPath);
      return {
        stopped: false,
        wasRunning: false,
        pid: pid || null
      };
    }

    process.kill(pid, 'SIGTERM');
    for (let index = 0; index < 20; index += 1) {
      if (!isProcessAlive(pid)) {
        break;
      }
      await delay(100);
    }
    await unlinkIfExists(this.pidPath);

    return {
      stopped: true,
      wasRunning: true,
      pid
    };
  }

  async getAdminUrl() {
    const envPath = join(this.projectDir, '.env');
    const env = parseEnv(await readText(envPath, ''));
    const host = env.ADMIN_HOST || process.env.ADMIN_HOST || '127.0.0.1';
    const port = env.ADMIN_PORT || process.env.ADMIN_PORT || '8787';
    return `http://${host}:${port}`;
  }

  async pingAdmin(url) {
    if (!this.fetchImpl) {
      return false;
    }
    try {
      const response = await this.fetchImpl(`${url}/api/status`, {
        signal: AbortSignal.timeout(800)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async waitForAdmin(url) {
    for (let index = 0; index < 25; index += 1) {
      if (await this.pingAdmin(url)) {
        return true;
      }
      await delay(200);
    }
    return false;
  }
}

async function inspectFile(path, name) {
  try {
    const info = await stat(path);
    return {
      name,
      path,
      exists: true,
      bytes: info.size,
      updatedAt: info.mtime.toISOString()
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        name,
        path,
        exists: false,
        bytes: 0,
        updatedAt: null
      };
    }
    throw error;
  }
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

async function readText(path, fallback) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

async function writeJsonAtomic(path, data) {
  const tempPath = `${path}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await rename(tempPath, path);
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function unlinkIfExists(path) {
  try {
    await unlink(path);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function readPid(path) {
  const content = await readText(path, '');
  const pid = Number.parseInt(content.trim(), 10);
  return Number.isFinite(pid) && pid > 0 ? pid : null;
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function normalizeKnowledgeImportItem(item, now) {
  return {
    id: normalizeText(item.id) || nanoid(),
    title: normalizeText(item.title),
    content: normalizeText(item.content),
    tags: normalizeList(item.tags),
    category: normalizeText(item.category),
    scenarios: normalizeList(item.scenarios),
    concepts: normalizeList(item.concepts),
    steps: normalizeList(item.steps),
    createdAt: normalizeText(item.createdAt) || now,
    updatedAt: now
  };
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

function knowledgeKey(item) {
  return normalizeText(item.title).toLowerCase();
}

function formatDateForName(date) {
  const parts = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ];
  return parts.join('');
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function sanitizeLabel(label) {
  return String(label)
    .trim()
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function parseEnv(content) {
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
  return env;
}
