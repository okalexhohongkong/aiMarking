import { bindAppearanceSettings } from './appearanceSettings.js';

const workflowViews = [
  {
    id: 'target',
    title: '锚定目标',
    step: '1 / 7',
    description: '先看系统目标、七维闭环、运行状态和当前项目定位。',
    moduleIds: ['marketing', 'status']
  },
  {
    id: 'content',
    title: '生成内容',
    step: '2 / 7',
    description: '整理知识库、知识图谱和内容资产，为后续问答、私信和成交承接提供素材。',
    moduleIds: ['knowledge']
  },
  {
    id: 'engagement',
    title: '评论私信管理',
    step: '3 / 7',
    description: '把评论、私信、资料领取、报价、案例和活动咨询沉淀为可复用转化剧本。',
    moduleIds: ['playbooks']
  },
  {
    id: 'private-message',
    title: '加私信',
    step: '4 / 7',
    description: '根据来源、地域、作品、留言和权益生成一次性私信，并进入人工审批队列。',
    moduleIds: ['private-message']
  },
  {
    id: 'ai-service',
    title: 'AI客服',
    step: '5 / 7',
    description: '查看多平台客服端口，用端口模拟器和问答测试验证统一客服引擎。',
    moduleIds: ['qa', 'channels', 'simulator']
  },
  {
    id: 'conversion',
    title: '引流成交',
    step: '6 / 7',
    description: '按客户生命周期、高意向线索和私域话术推动预约、定金、下单和复购。',
    moduleIds: ['lifecycle', 'growth', 'leads']
  },
  {
    id: 'system',
    title: '系统配置',
    step: '7 / 7',
    description: '集中管理平台凭证、界面风格、本机工具、Hermes 指令和并行任务调度。',
    moduleIds: ['appearance', 'hermes']
  }
];

const state = {
  knowledge: [],
  conversations: [],
  graph: { nodes: [], edges: [] },
  channelPorts: [],
  marketingSystem: null,
  projectProgress: null,
  integrationRoadmap: null,
  wecomReadiness: null,
  douyinReadiness: null,
  wechatPersonalReadiness: null,
  platformConfig: null,
  customerLifecycle: null,
  engagementPlaybooks: null,
  hermesCommands: [],
  privateMessageApprovals: [],
  lastPrivateMessageResult: null,
  orchestrationPlan: null,
  orchestrationPlanError: '',
  growth: {
    scripts: [],
    materials: [],
    rules: [],
    leads: []
  }
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  statusLine: $('#statusLine'),
  primaryNav: $('#primaryNav'),
  workflowTitle: $('#workflowTitle'),
  workflowDescription: $('#workflowDescription'),
  workflowStep: $('#workflowStep'),
  statusList: $('#statusList'),
  knowledgeCount: $('#knowledgeCount'),
  knowledgeList: $('#knowledgeList'),
  conversationList: $('#conversationList'),
  logCount: $('#logCount'),
  form: $('#knowledgeForm'),
  knowledgeId: $('#knowledgeId'),
  title: $('#titleInput'),
  tags: $('#tagsInput'),
  category: $('#categoryInput'),
  scenarios: $('#scenariosInput'),
  concepts: $('#conceptsInput'),
  steps: $('#stepsInput'),
  content: $('#contentInput'),
  askForm: $('#askForm'),
  question: $('#questionInput'),
  answerBox: $('#answerBox'),
  graphCount: $('#graphCount'),
  graphBox: $('#graphBox'),
  refresh: $('#refreshButton'),
  resetForm: $('#resetFormButton'),
  appearanceForm: $('#appearanceForm'),
  accentColor: $('#accentColorInput'),
  backgroundColor: $('#backgroundColorInput'),
  panelColor: $('#panelColorInput'),
  textColor: $('#textColorInput'),
  fontPreset: $('#fontPresetInput'),
  customFont: $('#customFontInput'),
  fontSize: $('#fontSizeInput'),
  fontSizeNumber: $('#fontSizeNumberInput'),
  fontSizeLabel: $('#fontSizeLabel'),
  resetAppearance: $('#resetAppearanceButton'),
  channelPortSummary: $('#channelPortSummary'),
  wecomReadinessSummary: $('#wecomReadinessSummary'),
  wecomReadinessBox: $('#wecomReadinessBox'),
  douyinReadinessSummary: $('#douyinReadinessSummary'),
  douyinReadinessBox: $('#douyinReadinessBox'),
  wechatPersonalReadinessSummary: $('#wechatPersonalReadinessSummary'),
  wechatPersonalReadinessBox: $('#wechatPersonalReadinessBox'),
  platformConfigSummary: $('#platformConfigSummary'),
  platformConfigList: $('#platformConfigList'),
  platformConfigBox: $('#platformConfigBox'),
  integrationRoadmap: $('#integrationRoadmap'),
  channelPortList: $('#channelPortList'),
  channelSimulateForm: $('#channelSimulateForm'),
  channelSimulateChannel: $('#channelSimulateChannelInput'),
  channelSimulateSender: $('#channelSimulateSenderInput'),
  channelSimulateRoom: $('#channelSimulateRoomInput'),
  channelSimulateText: $('#channelSimulateTextInput'),
  channelSimulateBox: $('#channelSimulateBox'),
  marketingSummary: $('#marketingSummary'),
  marketingModuleList: $('#marketingModuleList'),
  marketingPipeline: $('#marketingPipeline'),
  marketingCompliance: $('#marketingCompliance'),
  privateMessageForm: $('#privateMessageForm'),
  privatePlatform: $('#privatePlatformInput'),
  privateCustomer: $('#privateCustomerInput'),
  privateNeedOwner: $('#privateNeedOwnerInput'),
  privateIpProvince: $('#privateIpProvinceInput'),
  privateIpCity: $('#privateIpCityInput'),
  privateGender: $('#privateGenderInput'),
  privatePostPlatform: $('#privatePostPlatformInput'),
  privatePostLocation: $('#privatePostLocationInput'),
  privatePostTitle: $('#privatePostTitleInput'),
  privatePostPublishedAt: $('#privatePostPublishedAtInput'),
  privateCommentedAt: $('#privateCommentedAtInput'),
  privateCommentText: $('#privateCommentTextInput'),
  privateContentRelation: $('#privateContentRelationInput'),
  privateSentiment: $('#privateSentimentInput'),
  privateSolution: $('#privateSolutionInput'),
  privateOffer: $('#privateOfferInput'),
  privateOfficialSite: $('#privateOfficialSiteInput'),
  privateGroupInvite: $('#privateGroupInviteInput'),
  privateContact: $('#privateContactInput'),
  privateVerification: $('#privateVerificationInput'),
  privateMessageBox: $('#privateMessageBox'),
  privateApprovalSummary: $('#privateApprovalSummary'),
  privateApprovalList: $('#privateApprovalList'),
  lifecycleSummary: $('#lifecycleSummary'),
  lifecycleStageList: $('#lifecycleStageList'),
  playbookSummary: $('#playbookSummary'),
  playbookList: $('#playbookList'),
  hermesSummary: $('#hermesSummary'),
  hermesDirectionSummary: $('#hermesDirectionSummary'),
  hermesCommandForm: $('#hermesCommandForm'),
  hermesDirection: $('#hermesDirectionInput'),
  hermesType: $('#hermesTypeInput'),
  hermesSender: $('#hermesSenderInput'),
  hermesPriority: $('#hermesPriorityInput'),
  hermesTarget: $('#hermesTargetInput'),
  hermesModule: $('#hermesModuleInput'),
  hermesTask: $('#hermesTaskInput'),
  hermesText: $('#hermesTextInput'),
  hermesCommandList: $('#hermesCommandList'),
  orchestrationSummary: $('#orchestrationSummary'),
  orchestrationPlanMeta: $('#orchestrationPlanMeta'),
  orchestrationWorkstreamList: $('#orchestrationWorkstreamList'),
  orchestrationMergeList: $('#orchestrationMergeList'),
  orchestrationHermesPolicy: $('#orchestrationHermesPolicy'),
  blockerReportButton: $('#blockerReportButton'),
  blockerReportBox: $('#blockerReportBox'),
  growthSummary: $('#growthSummary'),
  growthForm: $('#growthForm'),
  growthPlatform: $('#growthPlatformInput'),
  growthStage: $('#growthStageInput'),
  growthGoal: $('#growthGoalInput'),
  growthInteraction: $('#growthInteractionInput'),
  growthCustomer: $('#growthCustomerInput'),
  growthMessage: $('#growthMessageInput'),
  growthReplyBox: $('#growthReplyBox'),
  leadCount: $('#leadCount'),
  leadList: $('#leadList'),
  growthLibrary: $('#growthLibrary'),
  localStatusButton: $('#localStatusButton'),
  localBackupButton: $('#localBackupButton'),
  localExportButton: $('#localExportButton'),
  localTemplateButton: $('#localTemplateButton'),
  localToolsBox: $('#localToolsBox')
};

bindAppearanceSettings({
  elements: {
    form: elements.appearanceForm,
    accentColor: elements.accentColor,
    backgroundColor: elements.backgroundColor,
    panelColor: elements.panelColor,
    textColor: elements.textColor,
    fontPreset: elements.fontPreset,
    customFont: elements.customFont,
    fontSize: elements.fontSize,
    fontSizeNumber: elements.fontSizeNumber,
    fontSizeLabel: elements.fontSizeLabel,
    resetButton: elements.resetAppearance
  },
  root: document.documentElement,
  storage: window.localStorage
});

initializeWorkflowMenu();
await refreshAll();

elements.refresh.addEventListener('click', refreshAll);
elements.primaryNav.addEventListener('click', handleWorkflowNavClick);
window.addEventListener('hashchange', () => showWorkflowView(currentWorkflowFromHash(), { updateHash: false }));
elements.resetForm.addEventListener('click', resetKnowledgeForm);
elements.form.addEventListener('submit', saveKnowledge);
elements.askForm.addEventListener('submit', askQuestion);
elements.channelSimulateForm.addEventListener('submit', simulateChannelMessage);
elements.privateMessageForm.addEventListener('submit', generatePrivateMessage);
elements.privateMessageBox.addEventListener('click', handlePrivateMessageBoxClick);
elements.privateApprovalList.addEventListener('click', handlePrivateApprovalClick);
elements.hermesCommandForm.addEventListener('submit', submitHermesCommand);
elements.growthForm.addEventListener('submit', generateGrowthReply);
elements.localStatusButton.addEventListener('click', checkLocalStatus);
elements.localBackupButton.addEventListener('click', createLocalBackup);
elements.localExportButton.addEventListener('click', exportLocalKnowledge);
elements.localTemplateButton.addEventListener('click', exportKnowledgeTemplate);
elements.blockerReportButton.addEventListener('click', reportHermesBlocker);

async function refreshAll() {
  const [
    status,
    knowledge,
    conversations,
    channelPorts,
    platformConfig,
    marketingSystem,
    projectProgress,
    integrationRoadmap,
    wecomReadiness,
    douyinReadiness,
    wechatPersonalReadiness,
    customerLifecycle,
    engagementPlaybooks,
    hermesCommands,
    privateMessageApprovals,
    orchestrationPlanResult
  ] = await Promise.all([
    api('/api/status'),
    api('/api/knowledge'),
    api('/api/conversations'),
    api('/api/channel-ports'),
    api('/api/platform-config'),
    api('/api/marketing-system'),
    api('/api/project-progress'),
    api('/api/integration-roadmap'),
    api('/api/wecom/readiness'),
    api('/api/douyin/readiness'),
    api('/api/wechat-personal/readiness'),
    api('/api/customer-lifecycle'),
    api('/api/engagement-playbooks'),
    api('/api/hermes/commands'),
    api('/api/private-message/approvals'),
    optionalApi('/api/orchestration-plan')
  ]);

  state.knowledge = knowledge;
  state.conversations = conversations;
  state.channelPorts = channelPorts;
  state.platformConfig = platformConfig;
  state.marketingSystem = marketingSystem;
  state.projectProgress = projectProgress;
  state.integrationRoadmap = integrationRoadmap;
  state.wecomReadiness = wecomReadiness;
  state.douyinReadiness = douyinReadiness;
  state.wechatPersonalReadiness = wechatPersonalReadiness;
  state.customerLifecycle = customerLifecycle;
  state.engagementPlaybooks = engagementPlaybooks;
  state.hermesCommands = hermesCommands;
  state.privateMessageApprovals = privateMessageApprovals;
  state.orchestrationPlan = orchestrationPlanResult.data;
  state.orchestrationPlanError = orchestrationPlanResult.error;
  state.graph = await api('/api/knowledge-graph');
  state.growth = {
    scripts: await api('/api/growth/scripts'),
    materials: await api('/api/growth/materials'),
    rules: await api('/api/growth/rules'),
    leads: await api('/api/growth/leads')
  };
  renderWorkflowMenu();
  renderStatus(status);
  renderProgressBadges();
  renderKnowledge();
  renderGraph();
  renderIntegrationRoadmap();
  renderWecomReadiness();
  renderDouyinReadiness();
  renderWechatPersonalReadiness();
  renderPlatformConfig();
  renderChannelPorts(status.channelPorts);
  renderChannelSelect();
  renderMarketingSystem();
  renderCustomerLifecycle();
  renderEngagementPlaybooks();
  renderHermesCommands();
  renderPrivateApprovals();
  renderOrchestrationPlan();
  renderConversations();
  renderGrowth();
  showWorkflowView(currentWorkflowFromHash(), { updateHash: false });
}

function initializeWorkflowMenu() {
  renderWorkflowMenu();
  showWorkflowView(currentWorkflowFromHash(), { updateHash: false });
}

function handleWorkflowNavClick(event) {
  const button = event.target.closest('[data-workflow-tab]');
  if (!button) {
    return;
  }
  showWorkflowView(button.dataset.workflowTab);
}

function currentWorkflowFromHash() {
  const hash = decodeURIComponent(window.location.hash || '').replace(/^#/, '');
  if (workflowViews.some((view) => view.id === hash)) {
    return hash;
  }
  return workflowViews[0].id;
}

function showWorkflowView(viewId, { updateHash = true } = {}) {
  const view = workflowViews.find((item) => item.id === viewId) || workflowViews[0];
  document.querySelectorAll('[data-workflow-view]').forEach((panel) => {
    const visible = panel.dataset.workflowView === view.id;
    panel.classList.toggle('workflow-hidden', !visible);
  });
  document.querySelectorAll('.layout, .insight-layout, .growth-layout').forEach((container) => {
    const visiblePanels = [...container.querySelectorAll(':scope > [data-workflow-view]')].filter(
      (panel) => !panel.classList.contains('workflow-hidden')
    );
    container.classList.toggle('workflow-empty', visiblePanels.length === 0);
    container.classList.toggle('workflow-single', visiblePanels.length === 1);
  });
  elements.primaryNav.querySelectorAll('[data-workflow-tab]').forEach((button) => {
    const active = button.dataset.workflowTab === view.id;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  });
  elements.workflowTitle.textContent = view.title;
  elements.workflowDescription.textContent = view.description;
  elements.workflowStep.textContent = view.step;
  if (updateHash) {
    window.history.replaceState(null, '', `#${view.id}`);
  }
}

function renderWorkflowMenu() {
  elements.primaryNav.innerHTML = workflowViews.map((view) => {
    const summary = workflowMenuSummary(view);
    return `
      <button type="button" data-workflow-tab="${escapeHtml(view.id)}" data-menu-tone="${escapeHtml(summary.tone)}" title="${escapeHtml(summary.title)}">
        <span class="menu-step">${escapeHtml(workflowStepNumber(view.step))}</span>
        <span class="menu-copy">
          <span class="menu-title">${escapeHtml(view.title)}</span>
          <span class="menu-meta">${escapeHtml(summary.meta)}</span>
        </span>
      </button>
    `;
  }).join('');
}

function workflowMenuSummary(view) {
  const modules = workflowModules(view);
  if (!modules.length) {
    return {
      meta: '流程数据加载中',
      tone: 'normal',
      title: `${view.title} · 等待流程数据`
    };
  }

  const paused = modules.filter((module) => module.tone === 'paused');
  const ahead = modules.filter((module) => module.tone === 'ahead');
  const average = modules.reduce((sum, module) => sum + module.percent, 0) / modules.length;
  const leadModule = paused[0] || modules.find((module) => module.remainingHours > 0) || ahead[0] || modules[0];
  const tone = paused.length ? 'paused' : ahead.length === modules.length ? 'ahead' : 'normal';
  const stateText = paused.length ? `${paused.length} 项暂停` : `${modules.length} 项流程`;

  return {
    meta: `${stateText} · ${formatProgressPercent(average)}`,
    tone,
    title: `${view.title} · 下一步：${leadModule.nextStep}`
  };
}

function workflowModules(view) {
  const progressById = new Map((state.projectProgress?.modules || []).map((module) => [module.id, module]));
  return (view.moduleIds || []).map((id) => progressById.get(id)).filter(Boolean);
}

function workflowStepNumber(step) {
  const number = String(step || '').split('/')[0].trim();
  return number.padStart(2, '0');
}

function formatProgressPercent(value) {
  const normalized = Math.max(0, Math.min(100, Number(value) || 0));
  return `${normalized.toFixed(1)}%`;
}

function renderProgressBadges() {
  const progressByTitle = new Map((state.projectProgress?.modules || []).map((module) => [module.title, module]));
  document.querySelectorAll('.panel-head h2, .status-panel > h2, .qa-panel > h2').forEach((heading) => {
    const title = heading.textContent.trim();
    const module = progressByTitle.get(title) || [...progressByTitle.entries()].find(([moduleTitle]) => title.startsWith(moduleTitle))?.[1];
    if (!module) {
      return;
    }
    const existing = heading.parentElement?.querySelector?.(`[data-progress-for="${module.id}"]`);
    if (existing) {
      existing.remove();
    }
    const badge = document.createElement('span');
    badge.className = `progress-badge ${module.tone}`;
    badge.dataset.progressFor = module.id;
    badge.title = `${module.colorLabel} · 下一步：${module.nextStep}`;
    badge.textContent = `⏱ ${module.countdownText} · ${module.percentText}`;

    if (heading.parentElement?.classList?.contains('panel-head')) {
      heading.parentElement.append(badge);
    } else {
      heading.insertAdjacentElement('afterend', badge);
    }
  });
}

function renderStatus(status) {
  elements.statusLine.textContent = `@${status.botMentionName || '智能客服'} · ${status.knowledgeBaseName || '知识库'}`;
  const rows = [
    ['企业微信凭证', status.hasWecomCredentials ? '已填写' : '未填写', status.hasWecomCredentials ? 'ok' : 'warn'],
    ['知识库密钥', status.hasOpenAiKey ? '已填写' : '未填写', status.hasOpenAiKey ? 'ok' : 'warn'],
    ['知识库接口', status.openaiBaseUrl || '-', ''],
    ['客服端口', formatPortSummary(status.channelPorts), ''],
    ['知识条目', `${status.knowledgeCount || 0} 条`, ''],
    ['问答记录', `${status.conversationCount || 0} 条`, '']
  ];

  elements.statusList.innerHTML = rows
    .map(([label, value, className]) => `<div><dt>${escapeHtml(label)}</dt><dd class="${className}">${escapeHtml(value)}</dd></div>`)
    .join('');
}

function renderKnowledge() {
  elements.knowledgeCount.textContent = `${state.knowledge.length} 条`;
  if (!state.knowledge.length) {
    elements.knowledgeList.innerHTML = '<div class="empty">还没有知识条目。</div>';
    return;
  }

  elements.knowledgeList.innerHTML = state.knowledge
    .map((item) => `
      <article class="item">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.content)}</p>
        <div class="meta-line">
          ${item.category ? `分类：${escapeHtml(item.category)} · ` : ''}
          ${item.scenarios?.length ? `场景：${escapeHtml(item.scenarios.join('、'))}` : ''}
        </div>
        <div class="meta-line">
          ${item.concepts?.length ? `概念：${escapeHtml(item.concepts.join('、'))}` : ''}
        </div>
        ${item.steps?.length ? `<ol class="steps-list">${item.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>` : ''}
        <div class="tags">${(item.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
        <div class="item-actions">
          <button type="button" class="secondary" data-edit="${item.id}">编辑</button>
          <button type="button" class="secondary" data-delete="${item.id}">删除</button>
        </div>
      </article>
    `)
    .join('');

  elements.knowledgeList.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => editKnowledge(button.dataset.edit));
  });
  elements.knowledgeList.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => deleteKnowledge(button.dataset.delete));
  });
}

function renderGraph() {
  const nodes = state.graph.nodes || [];
  const edges = state.graph.edges || [];
  elements.graphCount.textContent = `${nodes.length} 节点 · ${edges.length} 关系`;

  if (!nodes.length) {
    elements.graphBox.innerHTML = '<div class="empty">知识图谱会根据知识库自动生成。</div>';
    return;
  }

  const grouped = edges.slice(0, 12).map((edge) => {
    const from = nodes.find((node) => node.id === edge.from)?.label || edge.from;
    const to = nodes.find((node) => node.id === edge.to)?.label || edge.to;
    return `<li>${escapeHtml(from)} → ${escapeHtml(edgeLabel(edge.type))} → ${escapeHtml(to)}</li>`;
  });

  elements.graphBox.innerHTML = `<ul>${grouped.join('')}</ul>`;
}

function renderChannelPorts(summary = {}) {
  elements.channelPortSummary.textContent = formatPortSummary(summary);
  if (!state.channelPorts.length) {
    elements.channelPortList.innerHTML = '<div class="empty">还没有端口规划。</div>';
    return;
  }

  elements.channelPortList.innerHTML = state.channelPorts
    .map((port) => `
      <article class="channel-port-card">
        <div class="channel-port-head">
          <h3>${escapeHtml(port.name)}</h3>
          <span class="tag status ${statusClass(port.status)}">${escapeHtml(statusLabel(port.status))}</span>
        </div>
        <p>${escapeHtml(port.adapter)}</p>
        <div class="meta-line">分组：${escapeHtml(port.group)} · ${port.implemented ? '已接入 1.0' : '预留端口'}</div>
        <div class="tags">
          ${(port.capabilities || []).map((capability) => `<span class="tag">${escapeHtml(capability)}</span>`).join('')}
        </div>
        <div class="meta-line">合规：${escapeHtml(port.privateTrafficPolicy)}</div>
        <div class="meta-line">配置：${formatCredentialStatus(port.credentialStatus)}</div>
        <p>${escapeHtml(port.notes)}</p>
      </article>
    `)
    .join('');
}

function renderIntegrationRoadmap() {
  const roadmap = state.integrationRoadmap;
  if (!roadmap?.steps?.length) {
    elements.integrationRoadmap.innerHTML = '<div class="empty">正在整理平台接入路线图。</div>';
    return;
  }

  elements.integrationRoadmap.innerHTML = `
    <div class="roadmap-summary">
      <strong>接入路线图</strong>
      <span>${roadmap.summary.total} 个端口 · ${roadmap.summary.remainingHours.toFixed(1)} 小时倒计时</span>
      <span>${roadmap.summary.blocked} 等资料 · ${roadmap.summary.active} 正推进 · ${roadmap.summary.ready} 凭证已备</span>
    </div>
    <div class="integration-step-list">
      ${roadmap.steps.map((step) => renderIntegrationStep(step)).join('')}
    </div>
  `;
}

function renderWecomReadiness() {
  renderReadinessPanel({
    readiness: state.wecomReadiness,
    summaryElement: elements.wecomReadinessSummary,
    boxElement: elements.wecomReadinessBox,
    emptyText: '正在检查企业微信真实接入条件。'
  });
}

function renderDouyinReadiness() {
  renderReadinessPanel({
    readiness: state.douyinReadiness,
    summaryElement: elements.douyinReadinessSummary,
    boxElement: elements.douyinReadinessBox,
    emptyText: '正在检查抖音私信/客服接入条件。'
  });
}

function renderWechatPersonalReadiness() {
  renderReadinessPanel({
    readiness: state.wechatPersonalReadiness,
    summaryElement: elements.wechatPersonalReadinessSummary,
    boxElement: elements.wechatPersonalReadinessBox,
    emptyText: '正在检查个人微信/EasyClaw 接入条件。'
  });
}

function renderReadinessPanel({ readiness, summaryElement, boxElement, emptyText }) {
  if (!readiness) {
    summaryElement.textContent = '待加载';
    boxElement.innerHTML = `<div class="empty">${escapeHtml(emptyText)}</div>`;
    return;
  }

  summaryElement.textContent = `${readiness.percentText} · ${readiness.ready ? '可联调' : '缺资料'}`;
  boxElement.innerHTML = `
    <div class="readiness-summary ${readiness.ready ? 'ready' : 'blocked'}">
      <div>
        <strong>${escapeHtml(readiness.launch.title)}</strong>
        <p>${escapeHtml(readiness.launch.nextCommand)}</p>
      </div>
      <span class="tag status ${readiness.ready ? 'connected' : 'needs-credentials'}">${readiness.ready ? '可以联调' : '等待凭证'}</span>
    </div>
    <div class="readiness-grid">
      ${(readiness.checks || []).map(renderReadinessCheck).join('')}
    </div>
    <div class="readiness-plan">
      <section>
        <h3>下一步动作</h3>
        <ol>${(readiness.launch.nextSteps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
      </section>
      <section>
        <h3>测试群验证</h3>
        <p>${escapeHtml(readiness.groupTest.testGroup)}</p>
        <pre>${escapeHtml(readiness.groupTest.triggerText)}</pre>
        <ul>${(readiness.groupTest.passCriteria || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>
      <section>
        <h3>安全边界</h3>
        <ul>${(readiness.safety || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>
    </div>
  `;
}

function renderReadinessCheck(check) {
  return `
    <article class="readiness-check ${readinessStatusClass(check.status)}">
      <div class="channel-port-head">
        <h3>${escapeHtml(check.label)}</h3>
        <span class="tag status ${readinessStatusClass(check.status)}">${escapeHtml(readinessStatusLabel(check.status))}</span>
      </div>
      <p>${escapeHtml(check.detail)}</p>
      <div class="meta-line">${check.required ? '必填' : '选填'} · ${check.sensitive ? '敏感项已脱敏' : '非敏感项'}</div>
      <div class="meta-line">下一步：${escapeHtml(check.nextStep)}</div>
    </article>
  `;
}

function renderPlatformConfig() {
  const config = state.platformConfig;
  if (!config?.sections?.length) {
    elements.platformConfigSummary.textContent = '待加载';
    elements.platformConfigList.innerHTML = '<div class="empty">正在读取平台配置。</div>';
    return;
  }

  elements.platformConfigSummary.textContent =
    `${config.summary.filledRequired}/${config.summary.totalRequired} 必填项 · ${config.summary.percent.toFixed(1)}%`;
  elements.platformConfigList.innerHTML = config.sections.map(renderPlatformConfigSection).join('');
  elements.platformConfigList.querySelectorAll('[data-platform-config-form]').forEach((form) => {
    form.addEventListener('submit', savePlatformConfig);
  });
}

function renderPlatformConfigSection(section) {
  const requiredFields = section.fields.filter((field) => field.required);
  const optionalFields = section.fields.filter((field) => !field.required);
  return `
    <article class="platform-config-card ${sectionStatusClass(section.status)}">
      <div class="channel-port-head">
        <div>
          <h3>${escapeHtml(section.name)}</h3>
          <p>${escapeHtml(section.adapter || section.group || '')}</p>
        </div>
        <span class="tag status ${sectionStatusClass(section.status)}">${escapeHtml(platformConfigStatusLabel(section.status))}</span>
      </div>
      <div class="roadmap-meter" aria-label="${escapeHtml(section.name)}配置完成度">
        <span style="width: ${platformSectionPercent(section)}%"></span>
      </div>
      <div class="roadmap-facts">
        <span>必填 ${section.filledRequired}/${section.requiredCount}</span>
        <span>${section.implemented ? '1.0主线' : '预留接入'}</span>
      </div>
      <div class="meta-line">下一步：${escapeHtml(section.nextStep)}</div>
      <form class="platform-config-form" data-platform-config-form data-section-id="${escapeHtml(section.id)}">
        ${renderPlatformFieldGroup('必填', requiredFields)}
        ${optionalFields.length ? renderPlatformFieldGroup('选填', optionalFields) : ''}
        <button type="submit" class="secondary">保存本平台配置</button>
      </form>
    </article>
  `;
}

function renderPlatformFieldGroup(label, fields) {
  return `
    <div class="platform-field-group">
      <h4>${escapeHtml(label)}</h4>
      <div class="platform-field-grid">
        ${fields.map((field) => `
          <label>
            <span>${escapeHtml(field.label)} <em class="${field.configured ? 'ok' : 'warn'}">${field.configured ? '已配置' : '未配置'}</em></span>
            <input
              name="${escapeHtml(field.key)}"
              type="${field.sensitive ? 'password' : 'text'}"
              maxlength="4000"
              autocomplete="off"
              placeholder="${escapeHtml(field.placeholder)}"
              aria-label="${escapeHtml(field.label)}"
            />
            <small>${escapeHtml(field.help)} · ${escapeHtml(field.key)}</small>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function renderIntegrationStep(step) {
  const missing = step.missingRequired || [];
  const required = step.requiredEnv || [];
  return `
    <article class="integration-step ${roadmapStatusClass(step.status)}">
      <div class="integration-step-top">
        <span class="integration-priority">${String(step.priority).padStart(2, '0')}</span>
        <div>
          <h3>${escapeHtml(step.name)}</h3>
          <p>${escapeHtml(step.channel)}</p>
        </div>
        <span class="tag status ${roadmapStatusClass(step.status)}">${escapeHtml(step.statusLabel)}</span>
      </div>
      <div class="roadmap-meter" aria-label="${escapeHtml(step.name)}完成度${escapeHtml(step.percentText)}">
        <span style="width: ${Math.max(0, Math.min(100, step.percent))}%"></span>
      </div>
      <div class="roadmap-facts">
        <span>完成度 ${escapeHtml(step.percentText)}</span>
        <span>倒计时 ${escapeHtml(step.countdownText)}</span>
      </div>
      <div class="meta-line">下一步：${escapeHtml(step.nextStep)}</div>
      <div class="meta-line">当前阻塞：${missing.length ? `缺 ${escapeHtml(missing.join('、'))}` : '暂无'}</div>
      <div class="tags roadmap-env">
        ${required.map((item) => `<span class="tag ${item.filled ? 'high' : 'low'}">${escapeHtml(item.key)}：${item.filled ? '已填' : '未填'}</span>`).join('')}
      </div>
      <div class="meta-line">风险边界：${escapeHtml(step.risk)}</div>
    </article>
  `;
}

function renderMarketingSystem() {
  const system = state.marketingSystem;
  if (!system) {
    elements.marketingModuleList.innerHTML = '<div class="empty">正在读取黑卫士七维系统。</div>';
    return;
  }

  elements.marketingSummary.textContent = `${system.summary.total} 层 · ${system.summary.active} 已接入 · ${system.summary.ready} 可配置 · ${system.summary.planned} 规划中`;
  elements.marketingModuleList.innerHTML = system.modules
    .map((module) => `
      <article class="marketing-module-card">
        <div class="module-order">${module.order}</div>
        <div>
          <div class="channel-port-head">
            <h3>${escapeHtml(module.name)}</h3>
            <span class="tag status ${marketingStatusClass(module.status)}">${escapeHtml(module.statusLabel)}</span>
          </div>
          <p>${escapeHtml(module.objective)}</p>
          <div class="module-columns">
            ${moduleList('输入', module.inputs)}
            ${moduleList('输出', module.outputs)}
            ${moduleList('能力', module.capabilities)}
            ${moduleList('风控', module.safeguards)}
          </div>
          <div class="tags">${(module.kpis || []).map((kpi) => `<span class="tag">${escapeHtml(kpi)}</span>`).join('')}</div>
        </div>
      </article>
    `)
    .join('');

  elements.marketingPipeline.innerHTML = system.pipelineEdges
    .map(([from, to, label]) => {
      const fromModule = system.modules.find((module) => module.id === from);
      const toModule = system.modules.find((module) => module.id === to);
      return `<li>${escapeHtml(fromModule?.shortName || from)} → ${escapeHtml(toModule?.shortName || to)}：${escapeHtml(label)}</li>`;
    })
    .join('');

  elements.marketingCompliance.innerHTML = system.compliancePrinciples
    .map((principle) => `<li>${escapeHtml(principle)}</li>`)
    .join('');
}

function renderCustomerLifecycle() {
  const lifecycle = state.customerLifecycle;
  if (!lifecycle?.stages?.length) {
    elements.lifecycleSummary.textContent = '待加载';
    elements.lifecycleStageList.innerHTML = '<div class="empty">正在读取客户生命周期。</div>';
    return;
  }

  elements.lifecycleSummary.textContent = `${lifecycle.stages.length} 个阶段 · 售前售中售后全链路`;
  elements.lifecycleStageList.innerHTML = lifecycle.stages
    .map((stage) => `
      <article class="lifecycle-card">
        <div class="module-order">${stage.order}</div>
        <div>
          <div class="channel-port-head">
            <h3>${escapeHtml(stage.name)}</h3>
            <span class="tag status ${stage.requiresHumanApproval ? 'medium' : 'high'}">${stage.requiresHumanApproval ? '人工确认' : '可自动'}</span>
          </div>
          <p>${escapeHtml(stage.goal)}</p>
          <div class="module-columns three">
            ${moduleList('信任动作', stage.trustActions)}
            ${moduleList('价值钩子', stage.valueHooks)}
            ${moduleList('边界', stage.complianceBoundaries)}
          </div>
          <div class="tags">${(stage.channels || []).map((channel) => `<span class="tag">${escapeHtml(channel)}</span>`).join('')}</div>
        </div>
      </article>
    `)
    .join('');
}

function renderEngagementPlaybooks() {
  const playbooks = state.engagementPlaybooks;
  if (!playbooks?.playbooks?.length) {
    elements.playbookSummary.textContent = '待加载';
    elements.playbookList.innerHTML = '<div class="empty">正在读取私信/评论剧本。</div>';
    return;
  }

  elements.playbookSummary.textContent = `${playbooks.playbooks.length} 个场景 · ${playbooks.complianceRules?.length || 0} 条边界`;
  elements.playbookList.innerHTML = playbooks.playbooks
    .map((playbook) => `
      <article class="playbook-card">
        <div class="channel-port-head">
          <h3>${escapeHtml(playbook.name)}</h3>
          <span class="tag status ${playbook.contactPolicy?.requiresHumanApproval ? 'medium' : 'high'}">${playbook.contactPolicy?.requiresHumanApproval ? '人工确认' : '可自动'}</span>
        </div>
        <p>${escapeHtml(playbook.goal)}</p>
        <div class="meta-line">适用：${escapeHtml(playbook.scope)}</div>
        <div class="meta-line">停止条件：${escapeHtml(playbook.contactPolicy?.stopWhen || '按平台规则和用户意愿停止')}</div>
        ${playbook.messageElements?.length ? `<div class="tags">${playbook.messageElements.map((item) => `<span class="tag">${escapeHtml(item.label)}</span>`).join('')}</div>` : ''}
        ${playbook.actions?.length ? `<ul class="compact-list">${playbook.actions.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
        ${playbook.recommendedTemplate ? `<pre class="template-box">${escapeHtml(playbook.recommendedTemplate)}</pre>` : ''}
      </article>
    `)
    .join('');
}

function renderHermesCommands() {
  const commands = state.hermesCommands || [];
  const inboundCount = commands.filter((item) => normalizeHermesDirection(item.direction) === 'inbound').length;
  const outboundCount = commands.filter((item) => normalizeHermesDirection(item.direction) === 'outbound').length;
  elements.hermesSummary.textContent = `${commands.length} 条 · ${commands.filter((item) => item.status === 'new').length} 条待确认`;
  elements.hermesDirectionSummary.innerHTML = `
    <article>
      <strong>${inboundCount}</strong>
      <span>用户发给 Codex 的指令</span>
    </article>
    <article>
      <strong>${outboundCount}</strong>
      <span>Codex 回传给用户的阻塞/进度</span>
    </article>
    <article>
      <strong>${commands.filter((item) => item.priority === 'high').length}</strong>
      <span>高优先级，需要先看</span>
    </article>
  `;

  if (!commands.length) {
    elements.hermesCommandList.innerHTML = '<div class="empty">还没有 Hermes 双向指令。</div>';
    return;
  }

  elements.hermesCommandList.innerHTML = commands
    .map(renderHermesCommandCard)
    .join('');

  elements.hermesCommandList.querySelectorAll('[data-hermes-id]').forEach((button) => {
    button.addEventListener('click', () => updateHermesCommand(button.dataset.hermesId, button.dataset.hermesStatus));
  });
}

function renderHermesCommandCard(command) {
  const direction = normalizeHermesDirection(command.direction);
  const type = normalizeHermesType(command.type);
  const createdAt = command.createdAt ? new Date(command.createdAt).toLocaleString() : '待记录时间';
  const title = direction === 'outbound'
    ? `Codex → ${command.target || command.sender || '用户'}`
    : `${command.sender || command.source || '用户'} → Codex`;
  return `
    <article class="hermes-command-card ${escapeHtml(command.status)} ${direction}">
      <div class="channel-port-head">
        <h3>${escapeHtml(title)}</h3>
        <span class="tag status ${hermesStatusClass(command.status)}">${escapeHtml(hermesStatusLabel(command.status))}</span>
      </div>
      <p>${escapeHtml(command.text)}</p>
      <div class="tags">
        <span class="tag ${direction === 'outbound' ? 'medium' : 'active'}">${escapeHtml(hermesDirectionLabel(direction))}</span>
        <span class="tag">${escapeHtml(hermesTypeLabel(type))}</span>
        <span class="tag">${escapeHtml(command.target || '未指定目标')}</span>
        ${command.moduleId ? `<span class="tag">模块 ${escapeHtml(command.moduleId)}</span>` : ''}
        ${command.taskId ? `<span class="tag">任务 ${escapeHtml(command.taskId)}</span>` : ''}
        <span class="tag">${escapeHtml(command.source || 'hermes')}</span>
        <span class="tag ${command.priority === 'high' ? 'low' : ''}">${escapeHtml(command.priority || 'normal')}</span>
        <span class="tag">${escapeHtml(createdAt)}</span>
      </div>
      <div class="item-actions">
        <button type="button" class="secondary" data-hermes-status="accepted" data-hermes-id="${escapeHtml(command.id)}">接受</button>
        <button type="button" class="secondary" data-hermes-status="done" data-hermes-id="${escapeHtml(command.id)}">完成</button>
        <button type="button" class="secondary" data-hermes-status="ignored" data-hermes-id="${escapeHtml(command.id)}">忽略</button>
      </div>
    </article>
  `;
}

function renderOrchestrationPlan() {
  const plan = state.orchestrationPlan;
  if (!plan) {
    elements.orchestrationSummary.textContent = state.orchestrationPlanError ? '接口待后端提供' : '加载中';
    elements.orchestrationPlanMeta.innerHTML = `
      <div class="empty">等待后端提供 /api/orchestration-plan 后，这里会展示并行任务拆分、子任务、合并关口和 Hermes 回传策略。</div>
    `;
    elements.orchestrationWorkstreamList.innerHTML = '';
    elements.orchestrationMergeList.innerHTML = '';
    elements.orchestrationHermesPolicy.innerHTML = '';
    return;
  }

  const summary = plan.summary || {};
  const workstreams = plan.workstreams || [];
  elements.orchestrationSummary.textContent = `${workstreams.length} 条工作流 · ${summary.totalTasks || 0} 个任务 · ${summary.parallelSlots || workstreams.length} 个并行槽`;
  elements.orchestrationPlanMeta.innerHTML = `
    <div class="roadmap-summary">
      <strong>${escapeHtml(plan.name || '并行任务调度')}</strong>
      <span>${escapeHtml(summary.activeText || `${summary.activeWorkstreams || 0} 进行中`)}</span>
      <span>${escapeHtml(summary.mergeText || `${summary.mergeGates || 0} 个合并关口`)}</span>
    </div>
  `;
  elements.orchestrationWorkstreamList.innerHTML = workstreams.length
    ? workstreams.map(renderWorkstreamCard).join('')
    : '<div class="empty">暂未拆分并行工作流。</div>';
  elements.orchestrationMergeList.innerHTML = renderMergeGates(plan);
  elements.orchestrationHermesPolicy.innerHTML = renderHermesPolicy(plan.hermes);
}

function renderWorkstreamCard(workstream) {
  const childTasks = workstream.childTasks || workstream.tasks || [];
  return `
    <article class="orchestration-card ${roadmapStatusClass(workstream.status)}">
      <div class="channel-port-head">
        <h4>${escapeHtml(workstream.name || workstream.title || workstream.id)}</h4>
        <span class="tag status ${roadmapStatusClass(workstream.status)}">${escapeHtml(workstream.statusLabel || statusLabel(workstream.status))}</span>
      </div>
      <p>${escapeHtml(workstream.objective || workstream.description || workstream.nextStep || '')}</p>
      <div class="roadmap-meter" aria-label="${escapeHtml(workstream.name || workstream.id)}完成度${escapeHtml(workstream.percentText || '')}">
        <span style="width: ${Math.max(0, Math.min(100, Number(workstream.percent || 0)))}%"></span>
      </div>
      <div class="roadmap-facts">
        <span>剩余 ${escapeHtml(workstream.countdownText || `${workstream.remainingHours ?? '-'} 小时`)}</span>
        <span>${workstream.needsResplit ? '需要继续拆分' : '可并行推进'}</span>
      </div>
      <div class="meta-line">下一步：${escapeHtml(workstream.nextStep || '-')}</div>
      <div class="meta-line">合并关口：${escapeHtml(workstream.mergeGate || '-')}</div>
      ${childTasks.length ? `<ul class="compact-list">${childTasks.map(renderChildTaskItem).join('')}</ul>` : ''}
    </article>
  `;
}

function renderChildTaskItem(task) {
  const owner = task.ownerThread ? ` · ${task.ownerThread}` : '';
  const criteria = task.mergeCriteria ? ` · 合并：${task.mergeCriteria}` : '';
  return `<li>${escapeHtml(task.name || task.title || task.id)}${escapeHtml(owner)}${escapeHtml(criteria)}</li>`;
}

function renderMergeGates(plan) {
  const explicitGates = plan.mergeGates || plan.mergePlan || [];
  if (explicitGates.length) {
    return explicitGates.map((gate) => `
      <article class="orchestration-merge-card">
        <h4>${escapeHtml(gate.name || gate.title || gate.id)}</h4>
        <p>${escapeHtml(gate.criteria || gate.description || gate.nextStep || '')}</p>
      </article>
    `).join('');
  }

  const gates = (plan.workstreams || []).filter((workstream) => workstream.mergeGate);
  if (!gates.length) {
    return '<div class="empty">暂无合并关口。</div>';
  }
  return gates.map((workstream) => `
    <article class="orchestration-merge-card">
      <h4>${escapeHtml(workstream.name || workstream.id)}</h4>
      <p>${escapeHtml(workstream.mergeGate)}</p>
    </article>
  `).join('');
}

function renderHermesPolicy(hermes = {}) {
  const directionPolicy = hermes.directionPolicy || {};
  const templates = hermes.outboundTemplates || [];
  return `
    <div class="hermes-policy-box">
      <h4>Hermes 双向规则</h4>
      <p>${escapeHtml(directionPolicy.inbound || '用户指令进入收件箱，人工接受后执行。')}</p>
      <p>${escapeHtml(directionPolicy.outbound || 'Codex 遇到阻塞或需要资料时，回传中文阻塞/进度指令。')}</p>
      ${templates.length ? `<div class="tags">${templates.map((item) => `<span class="tag">${escapeHtml(hermesTypeLabel(item.type))}</span>`).join('')}</div>` : ''}
    </div>
  `;
}

function renderChannelSelect() {
  const current = elements.channelSimulateChannel.value;
  elements.channelSimulateChannel.innerHTML = state.channelPorts
    .map((port) => `<option value="${escapeHtml(port.id)}">${escapeHtml(port.name)}</option>`)
    .join('');

  if (state.channelPorts.some((port) => port.id === current)) {
    elements.channelSimulateChannel.value = current;
  }
}

function renderConversations() {
  elements.logCount.textContent = `${state.conversations.length} 条`;
  if (!state.conversations.length) {
    elements.conversationList.innerHTML = '<div class="empty">还没有问答记录。</div>';
    return;
  }

  elements.conversationList.innerHTML = state.conversations
    .map((log) => `
      <article class="item">
        <h3>${escapeHtml(log.question)}</h3>
        <p>${escapeHtml(log.answer)}</p>
        <div class="tags">
          <span class="tag">${escapeHtml(log.source || 'unknown')}</span>
          ${log.usedFallback ? '<span class="tag">本地兜底</span>' : ''}
          <span class="tag">${escapeHtml(new Date(log.createdAt).toLocaleString())}</span>
        </div>
      </article>
    `)
    .join('');
}

function renderGrowth() {
  elements.growthSummary.textContent = `${state.growth.scripts.length} 话术 · ${state.growth.materials.length} 素材 · ${state.growth.rules.length} 规则`;
  elements.leadCount.textContent = `${state.growth.leads.length} 条`;

  if (!state.growth.leads.length) {
    elements.leadList.innerHTML = '<div class="empty">还没有引流线索。</div>';
  } else {
    elements.leadList.innerHTML = state.growth.leads
      .map((lead) => `
        <article class="item">
          <h3>${escapeHtml(lead.customerName || lead.platform)}</h3>
          <p>${escapeHtml(lead.message)}</p>
          <div class="tags">
            <span class="tag">${escapeHtml(lead.platform)}</span>
            <span class="tag score ${scoreClass(lead.level)}">${escapeHtml(lead.level)} ${lead.score}</span>
            ${(lead.signals || []).map((signal) => `<span class="tag">${escapeHtml(signal)}</span>`).join('')}
          </div>
          <p>${escapeHtml(lead.suggestedReply)}</p>
        </article>
      `)
      .join('');
  }

  elements.growthLibrary.innerHTML = [
    ...state.growth.materials.slice(0, 3).map((item) => libraryItem('素材', item.name, item.description || item.cta)),
    ...state.growth.rules.slice(0, 3).map((item) => libraryItem('规则', item.name, `关键词：${(item.keywords || []).join('、')}`)),
    ...state.growth.scripts.slice(0, 3).map((item) => libraryItem('话术', item.scene, item.template))
  ].join('') || '<div class="empty">暂无引流配置。</div>';
}

async function saveKnowledge(event) {
  event.preventDefault();
  const id = elements.knowledgeId.value;
  const body = {
    title: elements.title.value,
    content: elements.content.value,
    tags: elements.tags.value,
    category: elements.category.value,
    scenarios: elements.scenarios.value,
    concepts: elements.concepts.value,
    steps: elements.steps.value
  };

  await api(id ? `/api/knowledge/${id}` : '/api/knowledge', {
    method: id ? 'PUT' : 'POST',
    body
  });

  resetKnowledgeForm();
  await refreshAll();
}

function editKnowledge(id) {
  const item = state.knowledge.find((entry) => entry.id === id);
  if (!item) {
    return;
  }
  elements.knowledgeId.value = item.id;
  elements.title.value = item.title;
  elements.tags.value = (item.tags || []).join(', ');
  elements.category.value = item.category || '';
  elements.scenarios.value = (item.scenarios || []).join(', ');
  elements.concepts.value = (item.concepts || []).join(', ');
  elements.steps.value = (item.steps || []).join('\n');
  elements.content.value = item.content;
  elements.title.focus();
}

async function deleteKnowledge(id) {
  await api(`/api/knowledge/${id}`, { method: 'DELETE' });
  await refreshAll();
}

function resetKnowledgeForm() {
  elements.knowledgeId.value = '';
  elements.form.reset();
}

async function askQuestion(event) {
  event.preventDefault();
  elements.answerBox.textContent = '正在查询知识库...';
  const result = await api('/api/ask', {
    method: 'POST',
    body: { question: elements.question.value }
  });
  elements.answerBox.textContent = result.answer;
  await refreshAll();
}

async function simulateChannelMessage(event) {
  event.preventDefault();
  const channelId = elements.channelSimulateChannel.value;
  const sender = elements.channelSimulateSender.value || 'sim-user';
  const roomId = elements.channelSimulateRoom.value || 'sim-room';
  const text = elements.channelSimulateText.value;

  elements.channelSimulateBox.textContent = '正在通过统一客服引擎模拟回复...';
  try {
    const result = await api(`/api/channels/${channelId}/simulate`, {
      method: 'POST',
      body: buildSimulatorPayload({ channelId, sender, roomId, text })
    });
    elements.channelSimulateBox.textContent = formatSimulationResult(result);
    await refreshAll();
  } catch (error) {
    elements.channelSimulateBox.textContent = error.message;
  }
}

async function savePlatformConfig(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const sectionId = form.dataset.sectionId;
  const values = {};
  for (const input of form.querySelectorAll('input[name]')) {
    if (input.value.trim()) {
      values[input.name] = input.value.trim();
    }
  }

  if (!Object.keys(values).length) {
    elements.platformConfigBox.textContent = '请至少填写一个配置项再保存。';
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  elements.platformConfigBox.textContent = '正在保存本机配置，密钥不会在页面回显...';
  try {
    const result = await api('/api/platform-config', {
      method: 'POST',
      body: { sectionId, values }
    });
    const status = await api('/api/status');
    state.platformConfig = result.config;
    state.channelPorts = await api('/api/channel-ports');
    state.integrationRoadmap = await api('/api/integration-roadmap');
    state.projectProgress = await api('/api/project-progress');
    renderStatus(status);
    renderPlatformConfig();
    renderIntegrationRoadmap();
    renderChannelPorts(status.channelPorts);
    renderProgressBadges();
    elements.platformConfigBox.textContent = [
      '保存完成',
      `模块：${sectionId}`,
      `写入项：${result.savedKeys.map((item) => `${item.key}=${item.sensitive ? '已脱敏保存' : '已保存'}`).join('、')}`,
      '提示：如果要启动真实平台服务，请重启后台或桌面 App。'
    ].join('\n');
  } catch (error) {
    elements.platformConfigBox.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function generateGrowthReply(event) {
  event.preventDefault();
  elements.growthReplyBox.textContent = '正在生成合规引流话术...';
  try {
    const result = await api('/api/growth/generate', {
      method: 'POST',
      body: {
        platform: elements.growthPlatform.value,
        customerName: elements.growthCustomer.value,
        message: elements.growthMessage.value,
        customerStage: elements.growthStage.value,
        goal: elements.growthGoal.value,
        interactionCount: Number(elements.growthInteraction.value || 1)
      }
    });
    elements.growthReplyBox.textContent = [
      result.lead ? `线索等级：${result.lead.level} ${result.lead.score}分` : '',
      `合规提示：${result.reason}`,
      '',
      result.reply
    ].filter(Boolean).join('\n');
    await refreshAll();
  } catch (error) {
    elements.growthReplyBox.textContent = error.message;
  }
}

async function generatePrivateMessage(event) {
  event.preventDefault();
  elements.privateMessageBox.textContent = '正在结合来源、地域、留言、权益和核验入口生成私信...';
  try {
    const result = await api('/api/private-message/generate', {
      method: 'POST',
      body: {
        platform: elements.privatePlatform.value,
        customerName: elements.privateCustomer.value,
        ipProvince: elements.privateIpProvince.value,
        ipCity: elements.privateIpCity.value,
        postPlatform: elements.privatePostPlatform.value,
        postLocation: elements.privatePostLocation.value,
        postTitle: elements.privatePostTitle.value,
        postPublishedAt: elements.privatePostPublishedAt.value,
        commentedAt: elements.privateCommentedAt.value,
        commentText: elements.privateCommentText.value,
        contentRelation: elements.privateContentRelation.value,
        sentiment: elements.privateSentiment.value,
        genderGuess: elements.privateGender.value,
        needOwner: elements.privateNeedOwner.value,
        solution: elements.privateSolution.value,
        offer: elements.privateOffer.value,
        officialSiteUrl: elements.privateOfficialSite.value,
        groupInviteUrl: elements.privateGroupInvite.value,
        contactUrl: elements.privateContact.value,
        companyVerification: elements.privateVerification.value
      }
    });
    state.lastPrivateMessageResult = result;
    elements.privateMessageBox.innerHTML = renderPrivateMessageResult(result);
  } catch (error) {
    elements.privateMessageBox.textContent = error.message;
  }
}

function handlePrivateMessageBoxClick(event) {
  const button = event.target.closest('[data-private-approval-create]');
  if (!button) {
    return;
  }
  queuePrivateMessageApproval(button);
}

async function queuePrivateMessageApproval(button) {
  const result = state.lastPrivateMessageResult;
  if (!result?.message) {
    elements.privateMessageBox.textContent = '请先生成一条可审核的私信。';
    return;
  }

  button.disabled = true;
  button.textContent = '已加入待审';
  try {
    await api('/api/private-message/approvals', {
      method: 'POST',
      body: {
        platform: elements.privatePlatform.value || result.platform || '平台私信',
        customerName: elements.privateCustomer.value || '',
        message: result.message,
        sourceTrace: result.sourceTrace || '',
        sendReadiness: result.sendReadiness || '',
        invitationTarget: result.invitationTarget || '',
        riskNotes: result.riskNotes || '',
        createdBy: 'dashboard'
      }
    });
    state.privateMessageApprovals = await api('/api/private-message/approvals');
    renderPrivateApprovals();
  } catch (error) {
    button.disabled = false;
    button.textContent = '加入审批队列';
    elements.privateMessageBox.insertAdjacentHTML('beforeend', `<p class="error-text">${escapeHtml(error.message)}</p>`);
  }
}

function handlePrivateApprovalClick(event) {
  const button = event.target.closest('[data-private-approval-status]');
  if (!button) {
    return;
  }
  updatePrivateApproval(button.dataset.privateApprovalId, button.dataset.privateApprovalStatus);
}

async function updatePrivateApproval(id, status) {
  await api(`/api/private-message/approvals/${id}`, {
    method: 'PUT',
    body: { status }
  });
  state.privateMessageApprovals = await api('/api/private-message/approvals');
  renderPrivateApprovals();
}

async function submitHermesCommand(event) {
  event.preventDefault();
  await api('/api/hermes/commands', {
    method: 'POST',
    body: {
      source: 'dashboard',
      direction: elements.hermesDirection.value,
      type: elements.hermesType.value,
      sender: elements.hermesSender.value,
      priority: elements.hermesPriority.value,
      target: elements.hermesTarget.value,
      moduleId: elements.hermesModule.value,
      taskId: elements.hermesTask.value,
      text: elements.hermesText.value
    }
  });
  elements.hermesText.value = '';
  await refreshAll();
}

async function updateHermesCommand(id, status) {
  await api(`/api/hermes/commands/${id}`, {
    method: 'PUT',
    body: { status }
  });
  await refreshAll();
}

async function reportHermesBlocker() {
  elements.blockerReportBox.textContent = '正在回传阻塞和进度...';
  try {
    const plan = state.orchestrationPlan || {};
    const blockedWorkstreams = (plan.workstreams || []).filter((item) => item.status === 'blocked' || item.needsResplit);
    const primaryBlocker = blockedWorkstreams[0];
    const missing = blockedWorkstreams.length
      ? blockedWorkstreams.map((item) => `${item.name || item.title || item.id}：${item.nextStep || item.mergeGate || '等待拆分'}`)
      : ['暂无明确阻塞，回传当前并行任务进度'];
    const result = await api('/api/hermes/blocker-report', {
      method: 'POST',
      body: {
        moduleId: primaryBlocker?.id || 'hermes-merge',
        taskId: primaryBlocker?.childTasks?.[0]?.id || primaryBlocker?.tasks?.[0]?.id || 'blocker-report',
        title: blockedWorkstreams.length ? '并行任务调度需要用户协助' : '并行任务调度进度同步',
        missing,
        nextStep: primaryBlocker?.nextStep || '继续按并行任务调度推进，等待合并关口确认。'
      }
    });
    elements.blockerReportBox.textContent = formatBlockerReportResult(result);
    await refreshAll();
  } catch (error) {
    elements.blockerReportBox.textContent = `回传未完成：${error.message}`;
  }
}

async function checkLocalStatus() {
  elements.localToolsBox.textContent = '正在检查本机状态...';
  try {
    const status = await api('/api/local/status');
    elements.localToolsBox.textContent = [
      `后台：${status.admin?.httpOk ? '可访问' : '未连通'}`,
      `地址：${status.admin?.url || '-'}`,
      `知识库：${status.counts?.knowledge || 0} 条`,
      `问答记录：${status.counts?.conversations || 0} 条`,
      `私域线索：${status.counts?.growthLeads || 0} 条`,
      `Hermes 指令：${status.counts?.hermesCommands || 0} 条`,
      `私信待审：${status.counts?.privateMessageApprovals || 0} 条`,
      `最新备份：${status.latestBackup?.name || '暂无'}`
    ].join('\n');
  } catch (error) {
    elements.localToolsBox.textContent = error.message;
  }
}

async function exportKnowledgeTemplate() {
  elements.localToolsBox.textContent = '正在生成知识库导入模板...';
  try {
    const result = await api('/api/local/export-knowledge-template', { method: 'POST' });
    elements.localToolsBox.textContent = [
      '模板已生成',
      `位置：${result.path}`,
      `示例：${result.itemCount} 条`
    ].join('\n');
  } catch (error) {
    elements.localToolsBox.textContent = error.message;
  }
}

async function createLocalBackup() {
  elements.localToolsBox.textContent = '正在备份本机数据...';
  try {
    const result = await api('/api/local/backup', { method: 'POST' });
    elements.localToolsBox.textContent = [
      '备份完成',
      `位置：${result.path}`,
      `文件：${(result.files || []).join('、') || '无'}`
    ].join('\n');
    await refreshAll();
  } catch (error) {
    elements.localToolsBox.textContent = error.message;
  }
}

async function exportLocalKnowledge() {
  elements.localToolsBox.textContent = '正在导出知识库...';
  try {
    const result = await api('/api/local/export-knowledge', { method: 'POST' });
    elements.localToolsBox.textContent = [
      '导出完成',
      `位置：${result.path}`,
      `数量：${result.itemCount} 条`
    ].join('\n');
  } catch (error) {
    elements.localToolsBox.textContent = error.message;
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.error || data?.reason || '请求失败');
  }
  return data;
}

async function optionalApi(path) {
  try {
    return { data: await api(path), error: '' };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function edgeLabel(type) {
  const labels = {
    belongs_to: '属于',
    tagged_as: '标签',
    applies_to: '适用',
    mentions: '涉及',
    has_step: '步骤',
    next_step: '下一步'
  };
  return labels[type] || type;
}

function scoreClass(level) {
  if (level === '高意向') return 'high';
  if (level === '中意向') return 'medium';
  return 'low';
}

function statusLabel(status) {
  const labels = {
    connected: '已接入',
    credentials_ready: '凭证已备',
    needs_credentials: '待填凭证',
    reserved: '已预留'
  };
  return labels[status] || status || '未知';
}

function statusClass(status) {
  if (status === 'connected') return 'high';
  if (status === 'credentials_ready') return 'medium';
  if (status === 'needs_credentials') return 'low';
  return 'reserved';
}

function hermesStatusLabel(status) {
  const labels = {
    new: '待确认',
    accepted: '已接受',
    done: '已完成',
    ignored: '已忽略'
  };
  return labels[status] || status || '未知';
}

function hermesStatusClass(status) {
  if (status === 'new') return 'active';
  if (status === 'accepted') return 'medium';
  if (status === 'done') return 'high';
  return 'reserved';
}

function normalizeHermesDirection(direction) {
  const normalized = String(direction || '').trim();
  if (['outbound', 'codex_to_user', 'codex-to-user', 'codexToUser'].includes(normalized)) {
    return 'outbound';
  }
  return 'inbound';
}

function hermesDirectionLabel(direction) {
  return normalizeHermesDirection(direction) === 'outbound'
    ? 'Codex 回传用户'
    : '用户发给 Codex';
}

function normalizeHermesType(type) {
  const normalized = String(type || '').trim();
  if (['task', 'blocker', 'progress', 'split', 'merge'].includes(normalized)) {
    return normalized;
  }
  if (['command', 'user_command'].includes(normalized)) {
    return 'task';
  }
  if (normalized === 'merge_gate') {
    return 'merge';
  }
  return 'task';
}

function hermesTypeLabel(type) {
  const labels = {
    task: '用户指令',
    blocker: '阻塞说明',
    progress: '进度同步',
    split: '任务拆分',
    merge: '合并关口'
  };
  return labels[normalizeHermesType(type)] || type || '用户指令';
}

function formatBlockerReportResult(result = {}) {
  const command = result.command || result.hermesCommand || result;
  return [
    '回传请求已提交',
    `类型：${hermesTypeLabel(command.type || result.type || 'progress')}`,
    `方向：${hermesDirectionLabel(command.direction || 'outbound')}`,
    `编号：${command.id || result.id || '-'}`,
    `状态：${hermesStatusLabel(command.status || result.status || 'new')}`,
    command.text || result.message || result.reason || ''
  ].filter(Boolean).join('\n');
}

function marketingStatusClass(status) {
  if (status === 'active') return 'high';
  if (status === 'ready') return 'medium';
  return 'reserved';
}

function roadmapStatusClass(status) {
  if (status === 'blocked') return 'blocked';
  if (status === 'active') return 'active';
  if (status === 'ready') return 'ready';
  return 'queued';
}

function sectionStatusClass(status) {
  if (status === 'connected' || status === 'credentials_ready') return 'ready';
  if (status === 'needs_credentials') return 'blocked';
  return 'queued';
}

function platformConfigStatusLabel(status) {
  const labels = {
    connected: '已具备接入条件',
    credentials_ready: '凭证已备',
    needs_credentials: '缺必填项',
    reserved: '待配置'
  };
  return labels[status] || status || '待配置';
}

function readinessStatusClass(status) {
  if (status === 'ready') return 'ready';
  if (status === 'missing') return 'blocked';
  if (status === 'defaulted' || status === 'manual') return 'active';
  return 'queued';
}

function readinessStatusLabel(status) {
  const labels = {
    ready: '已具备',
    missing: '缺少',
    optional: '选填',
    defaulted: '默认值',
    manual: '需确认'
  };
  return labels[status] || status || '待检查';
}

function platformSectionPercent(section) {
  if (!section.requiredCount) {
    return 100;
  }
  return Math.max(0, Math.min(100, Math.round((section.filledRequired / section.requiredCount) * 100)));
}

function formatPortSummary(summary = {}) {
  const total = summary.total || state.channelPorts.length || 0;
  const connected = summary.connected || 0;
  const ready = summary.credentialsReady || 0;
  const reserved = summary.reserved || 0;
  return `${total} 个端口 · ${connected} 已接入 · ${ready} 凭证已备 · ${reserved} 预留`;
}

function formatCredentialStatus(credentialStatus = {}) {
  const required = credentialStatus.required || [];
  if (!required.length) {
    return '无需额外配置';
  }
  const missing = required.filter((item) => !item.filled).map((item) => item.key);
  if (!missing.length) {
    return `${credentialStatus.filled}/${credentialStatus.total} 已填写`;
  }
  return `${credentialStatus.filled || 0}/${credentialStatus.total || required.length} 已填写，缺 ${missing.join('、')}`;
}

function libraryItem(type, title, content) {
  return `
    <article class="item">
      <h3>${escapeHtml(type)} · ${escapeHtml(title)}</h3>
      <p>${escapeHtml(content)}</p>
    </article>
  `;
}

function renderPrivateMessageResult(result) {
  const fields = [
    ['身份说明', result.identityIntro],
    ['联系原因', result.reasonForContact],
    ['来源追踪', result.sourceTrace],
    ['上下文摘要', result.contextSummary],
    ['发送判断', result.sendReadiness],
    ['信号判断', result.signalAssessment],
    ['知识库路由', result.knowledgeRouting],
    ['知识库方向', result.knowledgeFocus],
    ['需求判断', result.needHypothesis],
    ['正规核验', result.trustProof],
    ['核验清单', result.verificationChecklist],
    ['价值钩子', result.valueHook],
    ['资料/权益', result.offerLine],
    ['邀约目标', result.invitationTarget],
    ['邀约决策', result.invitationDecision],
    ['主要下一步', result.primaryCta],
    ['备用下一步', result.fallbackCta],
    ['风险提醒', result.riskNotes]
  ];

  return `
    <div class="private-message-copy">
      <h3>可发送私信</h3>
      <pre>${escapeHtml(result.message)}</pre>
      <div class="item-actions">
        <button type="button" data-private-approval-create>加入审批队列</button>
      </div>
    </div>
    <div class="private-message-fields">
      ${fields.map(([label, value]) => `
        <article>
          <h4>${escapeHtml(label)}</h4>
          <p>${escapeHtml(value)}</p>
        </article>
      `).join('')}
    </div>
  `;
}

function renderPrivateApprovals() {
  const approvals = state.privateMessageApprovals || [];
  const pendingCount = approvals.filter((item) => item.status === 'pending').length;
  elements.privateApprovalSummary.textContent = `${pendingCount} 条待审 · ${approvals.length} 条总计`;

  if (!approvals.length) {
    elements.privateApprovalList.innerHTML = '<div class="empty">还没有待审核私信。</div>';
    return;
  }

  elements.privateApprovalList.innerHTML = approvals
    .map((approval) => `
      <article class="private-approval-card ${escapeHtml(approval.status)}">
        <div class="channel-port-head">
          <h3>${escapeHtml(approval.customerName || approval.platform || '待发送客户')}</h3>
          <span class="tag status ${approvalStatusClass(approval.status)}">${escapeHtml(approvalStatusLabel(approval.status))}</span>
        </div>
        <pre>${escapeHtml(approval.message)}</pre>
        <div class="meta-line">来源：${escapeHtml(approval.sourceTrace || '待补充')} · 邀约：${escapeHtml(approval.invitationTarget || '待确认')}</div>
        <div class="meta-line">发送判断：${escapeHtml(approval.sendReadiness || '待人工审核')} · 风险：${escapeHtml(approval.riskNotes || '无')}</div>
        <div class="tags">
          <span class="tag">${escapeHtml(approval.platform || '平台私信')}</span>
          <span class="tag">${escapeHtml(new Date(approval.createdAt).toLocaleString())}</span>
        </div>
        <div class="item-actions">
          <button type="button" class="secondary" data-private-approval-status="approved" data-private-approval-id="${escapeHtml(approval.id)}">通过</button>
          <button type="button" class="secondary" data-private-approval-status="rejected" data-private-approval-id="${escapeHtml(approval.id)}">拒绝</button>
          <button type="button" class="secondary" data-private-approval-status="sent" data-private-approval-id="${escapeHtml(approval.id)}">已发送</button>
          <button type="button" class="secondary" data-private-approval-status="archived" data-private-approval-id="${escapeHtml(approval.id)}">归档</button>
        </div>
      </article>
    `)
    .join('');
}

function approvalStatusLabel(status) {
  const labels = {
    pending: '待人工审核',
    approved: '已通过',
    rejected: '已拒绝',
    sent: '已发送',
    archived: '已归档'
  };
  return labels[status] || status || '待人工审核';
}

function approvalStatusClass(status) {
  if (status === 'approved' || status === 'sent') return 'high';
  if (status === 'pending') return 'medium';
  if (status === 'rejected') return 'low';
  return 'reserved';
}

function moduleList(label, items = []) {
  return `
    <div>
      <h4>${escapeHtml(label)}</h4>
      <ul>${items.slice(0, 5).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </div>
  `;
}

function buildSimulatorPayload({ channelId, sender, roomId, text }) {
  const shared = {
    sender,
    userId: sender,
    openId: sender,
    fromUserId: sender,
    FromUserName: sender,
    buyerNick: sender,
    buyerId: sender,
    customerId: sender,
    roomId,
    chatId: roomId,
    groupId: roomId,
    conversationId: roomId,
    SessionFrom: roomId,
    sessionId: roomId,
    orderId: roomId,
    orderSn: roomId,
    text,
    content: text,
    message: text,
    messageId: `sim-${Date.now()}`
  };

  if (channelId === 'wecom') {
    shared.from = { userid: sender };
    shared.chatid = roomId;
    shared.msgid = shared.messageId;
  }

  return shared;
}

function formatSimulationResult(result) {
  if (!result.replied) {
    return `端口：${result.message?.channelId || '-'}\n结果：没有触发回复\n原因：${result.reason || '-'}`;
  }

  return [
    `端口：${result.channelName || result.channelId}`,
    `客户：${result.message?.sender || '-'}`,
    `会话：${result.message?.roomId || '-'}`,
    `合规：${result.policy?.guidance || '-'}`,
    `发送：${result.delivery?.delivered ? '已模拟发送' : '未发送'}`,
    '',
    result.reply || ''
  ].join('\n');
}
