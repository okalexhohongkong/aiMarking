import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('places the primary workflow menu in a left sidebar beside the content', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(
    html,
    /<main class="app-shell">\s*<aside class="app-sidebar">\s*<nav id="primaryNav" class="primary-nav"/s
  );
  assert.doesNotMatch(html, /data-workflow-tab="target"/);
  assert.match(html, /<\/aside>\s*<div class="app-content">\s*<header class="topbar">/s);
  assert.match(css, /\.app-shell\s*{[^}]*grid-template-columns:\s*156px minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.primary-nav\s*{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(app, /moduleIds:\s*\[/);
  assert.match(app, /function renderWorkflowMenu\(\)/);
  assert.match(app, /data-menu-tone/);
});

test('shows a seven-step workflow overview on the target homepage', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /七维流程总控台/);
  assert.match(html, /id="workflowOverviewCards"/);
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
