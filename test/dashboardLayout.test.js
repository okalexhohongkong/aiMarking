import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('places the primary workflow menu in a left sidebar beside the content', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /<main class="app-shell">\s*<aside class="app-sidebar">/s);
  assert.match(html, /<nav id="primaryNav" class="primary-nav"/);
  assert.doesNotMatch(html, /data-workflow-tab="target"/);
  assert.match(html, /<\/aside>\s*<div class="app-content">\s*<header class="topbar">/s);
  assert.match(css, /\.app-shell\s*{[^}]*grid-template-columns:\s*var\(--sidebar-width\) minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.primary-nav\s*{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(app, /moduleIds:\s*\[/);
  assert.match(app, /function renderWorkflowMenu\(\)/);
  assert.match(app, /data-menu-tone/);
});

test('adds searchable, lockable, and resizable sidebar controls', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /id="menuSearchInput"/);
  assert.match(html, /id="sidebarSettingsButton"/);
  assert.match(html, /id="sidebarLockButton"/);
  assert.match(html, /id="sidebarCollapseButton"/);
  assert.match(html, /id="sidebarResizeHandle"/);
  assert.match(css, /--sidebar-width/);
  assert.match(css, /\.sidebar-resize-handle/);
  assert.match(css, /\.sidebar-unlocked/);
  assert.match(css, /\.sidebar-collapsed/);
  assert.match(app, /sidebarLayoutStorageKey/);
  assert.match(app, /function handleMenuSearchInput/);
  assert.match(app, /function toggleSidebarLock/);
  assert.match(app, /function startSidebarResize/);
  assert.match(app, /showWorkflowView\('settings'\)/);
});

test('shows a twelve-entry workflow overview on the target homepage', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /七维流程总控台/);
  assert.match(html, /id="workflowOverviewCards"/);
  assert.match(html, /1 \/ 12/);
  assert.match(app, /step:\s*'12 \/ 12'/);
  assert.match(app, /title:\s*'输入中心'/);
  assert.match(app, /title:\s*'数据导入'/);
  assert.match(app, /title:\s*'外设接口'/);
  assert.match(app, /title:\s*'API接口'/);
  assert.match(app, /title:\s*'语音输入'/);
  assert.match(css, /\.workflow-overview-grid\s*{/);
  assert.match(app, /function renderWorkflowOverview\(\)/);
  assert.match(app, /data-workflow-jump/);
});

test('integrates platform readiness checks into one AI service hub', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /接入检查台/);
  assert.match(html, /id="readinessHubSummary"/);
  assert.match(html, /id="readinessHub"/);
  assert.doesNotMatch(html, /id="wecomReadinessBox"/);
  assert.doesNotMatch(html, /id="douyinReadinessBox"/);
  assert.doesNotMatch(html, /id="wechatPersonalReadinessBox"/);
  assert.match(css, /\.readiness-hub-grid\s*{/);
  assert.match(css, /\.readiness-platform-card\s*{/);
  assert.doesNotMatch(css, /\.douyin-readiness-panel/);
  assert.match(app, /function renderReadinessHub\(\)/);
  assert.match(app, /function getReadinessItems\(\)/);
  assert.match(app, /api\('\/api\/wecom\/readiness'\)/);
  assert.match(app, /api\('\/api\/douyin\/readiness'\)/);
  assert.match(app, /api\('\/api\/wechat-personal\/readiness'\)/);
});

test('adds AI HR style module management and delivery entry points', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /模块管理/);
  assert.match(html, /id="moduleSettingsList"/);
  assert.match(html, /交付入口/);
  assert.match(html, /黑卫士七维AI营销系统-1.0安装包/);
  assert.match(css, /\.module-setting-card\s*{/);
  assert.match(css, /\.delivery-grid\s*{/);
  assert.match(app, /workflowSettingsStorageKey/);
  assert.match(app, /function orderedWorkflowViews\(\)/);
  assert.match(app, /function handleWorkflowDrop/);
  assert.match(app, /draggable="true"/);
});

test('adds AI HR style input, API, device, and voice system entries', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /统一输入中心/);
  assert.match(html, /数据导入中心/);
  assert.match(html, /外设接口/);
  assert.match(html, /API接口中心/);
  assert.match(html, /AI语音输入/);
  assert.match(html, /id="sidebarColorInput"/);
  assert.match(html, /id="voiceTranscriptInput"/);
  assert.match(css, /\.input-method-grid\s*,/);
  assert.match(css, /\.voice-input-layout\s*{/);
  assert.match(app, /const inputModeRows/);
  assert.match(app, /function renderInputModeMatrix/);
  assert.match(app, /function startVoiceInput\(\)/);
  assert.match(app, /function applyVoiceInput\(\)/);
});

test('turns target anchoring into a structured audience profile collector', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /目标画像采集/);
  assert.match(html, /0\/16 已填写/);
  assert.match(html, /id="targetProfileForm"/);
  assert.match(html, /品牌\/项目名称/);
  assert.match(html, /所属市场\/行业/);
  assert.match(html, /年龄段/);
  assert.match(html, /重点省份\/区域/);
  assert.match(html, /对标对手/);
  assert.match(html, /喜欢的媒体\/平台/);
  assert.match(css, /\.target-profile-layout\s*{/);
  assert.match(app, /targetProfileStorageKey/);
  assert.match(app, /function buildTargetProfilePrompt/);
  assert.match(app, /function renderTargetProfilePreview/);
});
