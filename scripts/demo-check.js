import { readFile } from 'node:fs/promises';

const checks = [
  checkPackageScripts,
  checkEnvExample,
  checkDataFiles,
  checkPublicApp,
  checkDocs
];

let failed = 0;

console.log('黑卫士七维AI营销系统 Demo 版本检查');

for (const check of checks) {
  try {
    await check();
  } catch (error) {
    failed += 1;
    console.log(`- 失败：${error.message}`);
  }
}

if (failed) {
  console.log(`\n检查未通过：${failed} 项需要处理。`);
  process.exitCode = 1;
} else {
    console.log('\n检查通过：可以进入黑卫士七维AI营销系统本机 Demo 演示。');
  console.log('启动后台：npm run admin');
  console.log('打开地址：http://127.0.0.1:8787');
}

async function checkPackageScripts() {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  requireScript(pkg, 'admin');
  requireScript(pkg, 'local:status');
  requireScript(pkg, 'local:start');
  requireScript(pkg, 'local:stop');
  requireScript(pkg, 'local:backup');
  requireScript(pkg, 'local:restore');
  requireScript(pkg, 'local:import');
  requireScript(pkg, 'local:export');
  requireScript(pkg, 'blockers:watch');
  requireScript(pkg, 'hermes:command');
  requireScript(pkg, 'doctor');
  requireScript(pkg, 'test');
  requireScript(pkg, 'demo:check');
  pass('package.json 脚本齐全');
}

async function checkEnvExample() {
  const content = await readFile('.env.example', 'utf8');
  requireText(content, 'ADMIN_PORT=8787', '.env.example 缺少后台端口示例');
  requireText(content, 'OPENAI_BASE_URL=http://127.0.0.1:3688/v1', '.env.example 缺少 CCX/OpenAI 兼容接口示例');
  requireText(content, 'WECOM_BOT_ID=', '.env.example 缺少企业微信机器人配置');
  pass('.env.example 可用于本机配置');
}

async function checkDataFiles() {
  const knowledge = JSON.parse(await readFile('data/knowledge.json', 'utf8'));
  const growth = JSON.parse(await readFile('data/growth.json', 'utf8'));
  const conversations = JSON.parse(await readFile('data/conversations.json', 'utf8'));
  const hermesCommands = JSON.parse(await readFile('data/hermesCommands.json', 'utf8'));
  const privateMessageApprovals = JSON.parse(await readFile('data/privateMessageApprovals.json', 'utf8'));

  if (!Array.isArray(knowledge) || knowledge.length < 10) {
    throw new Error('知识库种子数据不足，Demo 至少需要 10 条知识');
  }
  if (!Array.isArray(growth.scripts) || !Array.isArray(growth.materials) || !Array.isArray(growth.rules)) {
    throw new Error('私域引流种子数据结构不完整');
  }
  if (!Array.isArray(conversations)) {
    throw new Error('消息日志文件必须是数组');
  }
  if (!Array.isArray(hermesCommands)) {
    throw new Error('Hermes 指令收件箱数据必须是数组');
  }
  if (!Array.isArray(privateMessageApprovals)) {
    throw new Error('私信审批队列数据必须是数组');
  }
  pass('知识库、自动私信、消息日志、私信审批队列和 Hermes 指令数据可读');
}

async function checkPublicApp() {
  const html = await readFile('public/index.html', 'utf8');
  const app = await readFile('public/app.js', 'utf8');
  const styles = await readFile('public/styles.css', 'utf8');

  for (const text of [
    '界面设置',
    '知识库',
    '多平台客服端口',
    '端口模拟器',
    '黑卫士七维AI营销系统',
    '自动私信生成器',
    '私信审批队列',
    '作品/账号位置',
    '客户生命周期',
    '私信/评论转化剧本',
    'Hermes 指令收件箱',
    '双向中心',
    '并行任务调度'
  ]) {
    requireText(html, text, `后台页面缺少模块：${text}`);
  }
  requireText(html, '/manifest.webmanifest', '后台页面缺少 PWA 入口');
  const manifest = await readFile('public/manifest.webmanifest', 'utf8');
  requireText(manifest, '黑卫士七维AI营销系统', 'PWA 清单缺少应用名称');
  requireText(app, '/api/marketing-system', '前端未读取黑卫士七维AI营销系统接口');
  requireText(app, '/api/private-message/generate', '前端未接入自动私信生成接口');
  requireText(app, '/api/private-message/approvals', '前端未接入私信审批队列接口');
  requireText(app, '/api/local/export-knowledge-template', '前端未接入知识库导入模板接口');
  requireText(app, '加入审批队列', '前端缺少私信加入审批队列入口');
  requireText(app, '来源追踪', '前端缺少私信来源追踪结果');
  requireText(app, '发送判断', '前端缺少私信发送判断结果');
  requireText(app, '信号判断', '前端缺少私信信号判断结果');
  requireText(app, '知识库路由', '前端缺少私信知识库路由结果');
  requireText(app, '知识库方向', '前端缺少私信知识库方向结果');
  requireText(app, '核验清单', '前端缺少私信核验清单结果');
  requireText(app, '邀约目标', '前端缺少私信邀约目标结果');
  requireText(app, '邀约决策', '前端缺少私信邀约决策结果');
  requireText(app, '/api/orchestration-plan', '前端未读取并行任务调度接口');
  requireText(app, '/api/hermes/blocker-report', '前端未接入 Hermes 阻塞/进度回传接口');
  requireText(app, '用户发给 Codex', '前端缺少 Hermes 入站方向展示');
  requireText(app, 'Codex 回传用户', '前端缺少 Hermes 出站方向展示');
  requireText(app, 'moduleId', '前端缺少 Hermes 模块字段');
  requireText(app, 'taskId', '前端缺少 Hermes 任务字段');
  for (const portId of [
    'wecom',
    'wechat-miniapp',
    'wechat-personal',
    'douyin',
    'kuaishou',
    'xiaohongshu',
    'wechat-channels',
    'taobao',
    'pinduoduo',
    'jd',
    'sms',
    'toutiao',
    'baijiahao',
    'bilibili',
    'zhihu',
    'linkedin',
    'facebook',
    'whatsapp',
    'x-twitter',
    'tiktok'
  ]) {
    requireText(html, `value="${portId}"`, `端口模拟器缺少端口：${portId}`);
  }
  requireAnyText(app, ['自动私信生成器', '客户生命周期', '私信/评论转化剧本', 'Hermes 指令收件箱', '并行任务调度'], '前端逻辑缺少新增模块名');
  requireText(styles, '.marketing-system-panel', '样式缺少黑卫士七维AI营销系统看板');
  requireText(styles, '.hermes-direction-summary', '样式缺少 Hermes 双向统计');
  requireText(styles, '.orchestration-panel', '样式缺少并行任务调度面板');
  requireText(styles, '.private-approval-card', '样式缺少私信审批队列卡片');
  pass('后台页面核心模块齐全');
}

async function checkDocs() {
  const readme = await readFile('README.md', 'utf8');
  const board = await readFile('docs/项目进度看板.md', 'utf8');
  const config = await readFile('docs/配置清单.md', 'utf8');
  const demo = await readFile('docs/演示脚本.md', 'utf8');
  requireText(readme, '本机 Demo 快速启动', 'README 缺少 Demo 快速启动说明');
  for (const [name, content] of [
    ['README', readme],
    ['项目进度看板', board],
    ['配置清单', config],
    ['演示脚本', demo]
  ]) {
    for (const text of [
      '黑卫士七维AI营销系统',
      '自动私信生成器',
      '私信审批队列',
      '知识库导入模板',
      '信号判断',
      '知识库方向',
      '邀约决策',
      '客户生命周期',
      '私信/评论转化剧本',
      'Hermes 指令收件箱'
    ]) {
      requireText(content, text, `${name} 缺少模块名：${text}`);
    }
  }
  for (const [name, content] of [
    ['项目进度看板', board],
    ['配置清单', config],
    ['演示脚本', demo]
  ]) {
    for (const text of [
      '双向中心',
      '并行任务调度'
    ]) {
      requireText(content, text, `${name} 缺少模块名：${text}`);
    }
  }
  requireText(demo, 'Demo 演示流程', '演示脚本缺少标题');
  pass('README、看板、配置清单和演示脚本文档齐全');
}

function requireScript(pkg, name) {
  if (!pkg.scripts?.[name]) {
    throw new Error(`package.json 缺少 npm run ${name}`);
  }
}

function requireText(content, expected, message) {
  if (!content.includes(expected)) {
    throw new Error(message);
  }
}

function requireAnyText(content, expectedList, message) {
  for (const expected of expectedList) {
    if (content.includes(expected)) {
      return;
    }
  }
  throw new Error(message);
}

function pass(message) {
  console.log(`- 通过：${message}`);
}
