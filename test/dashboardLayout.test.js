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

test('shows a dedicated wecom readiness panel in the AI service workflow', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /id="wecomReadinessSummary"/);
  assert.match(html, /id="wecomReadinessBox"/);
  assert.match(html, /企业微信真实接入检查/);
  assert.match(css, /\.readiness-grid\s*{/);
  assert.match(app, /api\('\/api\/wecom\/readiness'\)/);
  assert.match(app, /function renderWecomReadiness\(\)/);
});

test('shows a dedicated douyin readiness panel in the AI service workflow', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /id="douyinReadinessSummary"/);
  assert.match(html, /id="douyinReadinessBox"/);
  assert.match(html, /抖音私信\/客服接入检查/);
  assert.match(css, /\.douyin-readiness-panel/);
  assert.match(app, /api\('\/api\/douyin\/readiness'\)/);
  assert.match(app, /function renderDouyinReadiness\(\)/);
});
