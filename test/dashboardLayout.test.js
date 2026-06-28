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

test('lets the primary sidebar switch between fixed and hover auto-hide modes', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /id="sidebarPeekZone"/);
  assert.match(html, /靠近展开菜单，双击固定显示/);
  assert.match(app, /mode:\s*'auto-hide'/);
  assert.match(app, /mode === 'auto-hide'/);
  assert.match(app, /function toggleSidebarMode/);
  assert.match(app, /function handleSidebarDoubleClick/);
  assert.match(app, /addEventListener\('dblclick', handleSidebarDoubleClick\)/);
  assert.match(app, /function openSidebarPeek/);
  assert.match(app, /function scheduleSidebarAutoHide/);
  assert.match(app, /setTimeout\([^)]*1000/s);
  assert.match(app, /sidebar-peeking/);
  assert.match(app, /sidebar-auto-hide/);
  assert.match(css, /\.sidebar-peek-zone/);
  assert.match(css, /\.sidebar-auto-hide\s*{\s*--sidebar-width:\s*0px/s);
  assert.match(css, /\.sidebar-auto-hide \.app-sidebar\s*{[^}]*position:\s*fixed/s);
  assert.match(css, /\.sidebar-auto-hide \.sidebar-peek-zone:hover \+ \.app-shell \.app-sidebar/s);
  assert.match(css, /\.sidebar-auto-hide\.sidebar-peeking \.app-sidebar/s);
  assert.match(css, /\.sidebar-auto-hide \.app-sidebar:hover/s);
});

test('shows an eleven-entry workflow overview on the target homepage without a standalone voice module', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /七维流程总控台/);
  assert.match(html, /id="workflowOverviewCards"/);
  assert.match(html, /1 \/ 11/);
  assert.match(app, /step:\s*'11 \/ 11'/);
  assert.match(app, /title:\s*'输入中心'/);
  assert.match(app, /title:\s*'数据导入\/导出'/);
  assert.match(app, /title:\s*'外设接口'/);
  assert.match(app, /title:\s*'API接口'/);
  assert.doesNotMatch(app, /id:\s*'voice-input'/);
  assert.doesNotMatch(app, /data-workflow-view="voice-input"/);
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

test('adds AI HR style input, import/export, API, and device entries', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /统一输入中心/);
  assert.match(html, /数据导入\/导出中心/);
  assert.match(html, /数据导出/);
  assert.match(html, /id="dataExportKnowledgeButton"/);
  assert.match(html, /id="dataExportTemplateButton"/);
  assert.match(html, /外设接口/);
  assert.match(html, /API接口中心/);
  assert.match(html, /id="sidebarColorInput"/);
  assert.match(css, /\.input-method-grid\s*,/);
  assert.match(app, /const inputModeRows/);
  assert.match(app, /function renderInputModeMatrix/);
  assert.match(app, /dataExportKnowledge/);
  assert.match(app, /dataExportTemplate/);
});

test('adds compact input assist controls with voice and recommendation dropdowns', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /id="voiceGlobalStatus"/);
  assert.doesNotMatch(html, /id="voiceInputForm"/);
  assert.match(app, /function enhanceVoiceInputControls/);
  assert.match(app, /inputAssistStorageKey/);
  assert.match(app, /function renderSuggestionMenu/);
  assert.match(app, /function addCustomSuggestion/);
  assert.match(app, /function applySuggestionToField/);
  assert.match(app, /data-voice-target-id/);
  assert.match(app, /data-suggestion-target-id/);
  assert.match(app, /function startInlineVoiceInput/);
  assert.match(app, /function isVoiceEligibleField/);
  assert.match(app, /function microphoneIconSvg/);
  assert.match(app, /voiceButton\.innerHTML = microphoneIconSvg\(\)/);
  assert.doesNotMatch(app, /voiceButton\.textContent = '麦'/);
  assert.match(css, /\.input-assist-wrap/);
  assert.match(css, /\.input-assist-tools/);
  assert.match(css, /\.field-voice-button/);
  assert.match(css, /\.field-suggestion-button/);
  assert.match(css, /\.input-suggestion-menu/);
  assert.match(css, /\.voice-global-status/);
  assert.doesNotMatch(app, /voiceTargetInput/);
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

test('connects first, second, and third level menu items to real page sections', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /data-menu-section="target-profile"/);
  assert.match(html, /data-menu-section="private-message-generator"/);
  assert.match(html, /data-menu-section="private-message-approval"/);
  assert.match(html, /data-menu-section="api-platform-config"/);
  assert.match(app, /menuSections:\s*\[/);
  assert.match(app, /icon:\s*'target'/);
  assert.match(app, /function renderWorkflowLogo/);
  assert.doesNotMatch(app, /class="menu-step"/);
  assert.match(app, /menuExpansionStorageKey/);
  assert.match(app, /function toggleMenuView/);
  assert.match(app, /function toggleMenuSection/);
  assert.match(app, /aria-expanded/);
  assert.match(app, /data-menu-drag-id/);
  assert.match(app, /function handleMenuTreeDrop/);
  assert.match(app, /data-menu-section-target/);
  assert.match(app, /function handleMenuSectionClick/);
  assert.match(app, /function scrollToMenuSection/);
  assert.match(app, /function flattenMenuSections/);
  assert.match(app, /function orderedSectionChildren/);
  assert.match(css, /\.workflow-menu-group/);
  assert.match(css, /\.menu-logo/);
  assert.match(css, /\.menu-expand-indicator/);
  assert.match(css, /\.menu-layout-editing/);
  assert.match(css, /\.workflow-submenu/);
  assert.match(css, /\.workflow-tertiary-menu/);
});

test('lets the settings panel manage submodule ownership, size, and locks', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /二级页面板块/);
  assert.match(app, /sectionOrder/);
  assert.match(app, /sectionSizes/);
  assert.match(app, /sectionLocks/);
  assert.match(app, /childOrder/);
  assert.match(app, /childLocks/);
  assert.match(app, /data-section-size/);
  assert.match(app, /data-section-lock/);
  assert.match(app, /data-section-parent/);
  assert.match(app, /data-child-module-id/);
  assert.match(app, /data-child-lock/);
  assert.match(app, /function handleSectionSettingsChange/);
  assert.match(app, /function reorderChildSection/);
  assert.match(app, /function applyPanelLayoutSettings/);
  assert.match(css, /\.panel-size-wide/);
  assert.match(css, /\.panel-size-tall/);
  assert.match(css, /\.panel-size-large/);
  assert.match(css, /\.panel-size-compact/);
  assert.match(css, /\.panel-locked/);
});

test('adds AI calling, Yunke manual call import, and CRM import modules', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /AI呼叫模块/);
  assert.match(html, /人工呼叫导入云客/);
  assert.match(html, /导入到CRM系统/);
  assert.match(html, /data-menu-section="ai-call-center"/);
  assert.match(html, /data-menu-section="yunke-call-import"/);
  assert.match(html, /data-menu-section="crm-import"/);
  assert.match(html, /id="aiCallBlueprint"/);
  assert.match(html, /id="yunkeCallImportBlueprint"/);
  assert.match(html, /id="crmImportBlueprint"/);
  assert.match(app, /id:\s*'ai-call-center'/);
  assert.match(app, /id:\s*'yunke-call-import'/);
  assert.match(app, /id:\s*'crm-import'/);
  assert.match(app, /moduleIds:\s*\['ai-call', 'channels', 'qa', 'simulator'\]/);
  assert.match(app, /optionalApi\('\/api\/call-crm-blueprint'\)/);
  assert.match(app, /function renderCallCrmBlueprint/);
  assert.match(app, /function handleMenuJumpClick/);
  assert.match(app, /function renderFieldMappingPreview/);
  assert.match(app, /function renderOperationPreview/);
  assert.match(app, /function renderPreviewControls/);
  assert.match(app, /function renderReviewQueue/);
  assert.match(app, /function renderSandboxValidation/);
  assert.match(app, /function renderMissingMaterials/);
  assert.match(app, /function renderCredentialBlockers/);
  assert.match(app, /function renderImportTemplate/);
  assert.match(app, /字段映射预览/);
  assert.match(app, /预览明细/);
  assert.match(app, /异常筛选/);
  assert.match(app, /人工复核清单/);
  assert.match(app, /沙盒校验结果/);
  assert.match(app, /还需要提供/);
  assert.match(app, /凭证缺口/);
  assert.doesNotMatch(app, /\$\{escapeHtml\(field\.help\)\} · \$\{escapeHtml\(field\.key\)\}/);
  assert.match(app, /data-menu-jump="api-platform-config"/);
  assert.match(css, /\.call-module-grid/);
  assert.match(css, /\.call-blueprint-card/);
  assert.match(css, /\.call-blueprint-actions/);
  assert.match(css, /\.credential-checklist/);
  assert.match(css, /\.import-template-preview/);
  assert.match(css, /\.field-mapping-preview/);
  assert.match(css, /\.field-mapping-row/);
  assert.match(css, /\.operation-preview/);
  assert.match(css, /\.operation-preview-row/);
  assert.match(css, /\.preview-control-grid/);
  assert.match(css, /\.review-queue-list/);
  assert.match(css, /\.sandbox-validation-panel/);
  assert.match(css, /\.sandbox-validation-check/);
});

test('adds disaster recovery backup center and agent access center to the dashboard', async () => {
  const html = await readFile('public/index.html', 'utf8');
  const css = await readFile('public/styles.css', 'utf8');
  const app = await readFile('public/app.js', 'utf8');

  assert.match(html, /容灾备份中心/);
  assert.match(html, /id="resilienceBackupBlueprint"/);
  assert.match(html, /Agent接入中心/);
  assert.match(html, /id="agentAccessBlueprint"/);
  assert.match(html, /Open cloud agent/);
  assert.match(html, /Hermes agent/);
  assert.match(html, /自定义Agent/);
  assert.match(html, /data-menu-section="resilience-backup-center"/);
  assert.match(html, /data-menu-section="agent-access-center"/);
  assert.match(app, /id:\s*'resilience-backup-center'/);
  assert.match(app, /id:\s*'agent-access-center'/);
  assert.match(app, /optionalApi\('\/api\/resilience-backup-blueprint'\)/);
  assert.match(app, /optionalApi\('\/api\/agent-access-blueprint'\)/);
  assert.match(app, /function renderResilienceBackupBlueprint/);
  assert.match(app, /function renderAgentAccessBlueprint/);
  assert.match(app, /dry_run_preview/);
  assert.match(app, /不自动执行/);
  assert.match(css, /\.resilience-backup-grid/);
  assert.match(css, /\.agent-access-grid/);
  assert.match(css, /\.agent-access-card/);
});
