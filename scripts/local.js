#!/usr/bin/env node
import 'dotenv/config';
import { LocalOperations } from '../src/localOperations.js';

const commands = {
  status: showStatus,
  start: startAdmin,
  stop: stopAdmin,
  backup: createBackup,
  restore: restoreBackup,
  'import-knowledge': importKnowledge,
  'export-knowledge': exportKnowledge
};

const [command = 'status', ...args] = process.argv.slice(2);
const action = commands[command];

if (!action) {
  printHelp();
  process.exitCode = 1;
} else {
  action(args).catch((error) => {
    console.error(`执行失败：${error.message}`);
    process.exitCode = 1;
  });
}

async function showStatus() {
  const ops = new LocalOperations();
  const status = await ops.getDataStatus();
  console.log('本机状态');
  console.log(`- 项目目录：${status.projectDir}`);
  console.log(`- 后台地址：${status.admin.url}`);
  console.log(`- 后台进程：${status.admin.processAlive ? `运行中 PID ${status.admin.pid}` : '未运行'}`);
  console.log(`- 后台接口：${status.admin.httpOk ? '可访问' : '未连通'}`);
  console.log(`- 知识库：${status.counts.knowledge} 条`);
  console.log(`- 问答记录：${status.counts.conversations} 条`);
  console.log(`- 私域线索：${status.counts.growthLeads} 条`);
  console.log(`- Hermes 指令：${status.counts.hermesCommands || 0} 条`);
  console.log(`- 最新备份：${status.latestBackup?.name || '暂无'}`);
}

async function startAdmin() {
  const result = await new LocalOperations().startAdmin();
  if (result.alreadyRunning) {
    console.log(`后台已经在运行：${result.url}`);
    return;
  }
  console.log(`后台已启动：${result.url}`);
  console.log(`日志文件：${result.logPath}`);
  if (!result.httpOk) {
    console.log('提示：进程已启动，但接口还没有连通，请稍后再看日志。');
  }
}

async function stopAdmin() {
  const result = await new LocalOperations().stopAdmin();
  console.log(result.wasRunning ? `后台已停止：PID ${result.pid}` : '后台没有运行。');
}

async function createBackup() {
  const result = await new LocalOperations().createBackup({ label: 'manual' });
  console.log(`备份已完成：${result.path}`);
  console.log(`包含文件：${result.files.join(', ') || '无'}`);
}

async function restoreBackup(args) {
  const result = await new LocalOperations().restoreBackup(args[0]);
  console.log(`已从备份恢复：${result.restoredFrom}`);
  console.log(`恢复文件：${result.restoredFiles.join(', ') || '无'}`);
  console.log(`恢复前安全备份：${result.safetyBackup.path}`);
}

async function importKnowledge(args) {
  const result = await new LocalOperations().importKnowledge(args[0]);
  console.log(`知识库导入完成：新增 ${result.importedCount} 条，跳过 ${result.skippedCount} 条。`);
  console.log(`当前知识库总数：${result.totalCount} 条`);
}

async function exportKnowledge() {
  const result = await new LocalOperations().exportKnowledge();
  console.log(`知识库已导出：${result.path}`);
  console.log(`导出数量：${result.itemCount} 条`);
}

function printHelp() {
  console.log(`可用命令：
node scripts/local.js status
node scripts/local.js start
node scripts/local.js stop
node scripts/local.js backup
node scripts/local.js restore [备份文件夹名]
node scripts/local.js import-knowledge <知识库JSON文件>
node scripts/local.js export-knowledge`);
}
