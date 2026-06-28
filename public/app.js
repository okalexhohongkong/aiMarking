import { bindAppearanceSettings } from './appearanceSettings.js';

const workflowSettingsStorageKey = 'wecom-ai-customer-service.workflow-settings';
const targetProfileStorageKey = 'wecom-ai-customer-service.target-profile';
const sidebarLayoutStorageKey = 'wecom-ai-customer-service.sidebar-layout';
const inputAssistStorageKey = 'wecom-ai-customer-service.input-assist-custom-options';
const menuExpansionStorageKey = 'wecom-ai-customer-service.menu-expansion';
let sidebarAutoHideTimer = null;

const workflowViews = [
  {
    id: 'target',
    icon: 'target',
    title: '锚定目标',
    step: '1 / 11',
    description: '先看系统目标、七维闭环、运行状态和当前项目定位。',
    moduleIds: ['marketing', 'status']
  },
  {
    id: 'content',
    icon: 'content',
    title: '生成内容',
    step: '2 / 11',
    description: '整理知识库、知识图谱和内容资产，为后续问答、私信和成交承接提供素材。',
    moduleIds: ['knowledge']
  },
  {
    id: 'engagement',
    icon: 'chat',
    title: '评论私信管理',
    step: '3 / 11',
    description: '把评论、私信、资料领取、报价、案例和活动咨询沉淀为可复用转化剧本。',
    moduleIds: ['playbooks']
  },
  {
    id: 'private-message',
    icon: 'message',
    title: '加私信',
    step: '4 / 11',
    description: '根据来源、地域、作品、留言和权益生成一次性私信，并进入人工审批队列。',
    moduleIds: ['private-message']
  },
  {
    id: 'ai-service',
    icon: 'service',
    title: 'AI客服',
    step: '5 / 11',
    description: '在同一工作台查看平台接入、端口、问答测试和知识图谱，验证统一客服引擎。',
    moduleIds: ['ai-call', 'channels', 'qa', 'simulator']
  },
  {
    id: 'conversion',
    icon: 'deal',
    title: '引流成交',
    step: '6 / 11',
    description: '按客户生命周期、高意向线索和私域话术推动预约、定金、下单和复购。',
    moduleIds: ['lifecycle', 'growth', 'leads']
  },
  {
    id: 'input-center',
    icon: 'input',
    title: '输入中心',
    step: '7 / 11',
    description: '统一管理手动输入、表格导入、数据库导入和 API 导入；所有文字输入口都带语音按钮。',
    moduleIds: ['input-center']
  },
  {
    id: 'data-import',
    icon: 'data',
    title: '数据导入/导出',
    step: '8 / 11',
    description: '把知识库、评论私信样本、目标画像和外部业务数据统一导入系统，也支持模板和知识库导出。',
    moduleIds: ['data-import', 'yunke-call-import', 'crm-import']
  },
  {
    id: 'device-ports',
    icon: 'device',
    title: '外设接口',
    step: '9 / 11',
    description: '预留手机、企业微信、个人微信、平台客服终端、语音录音和会议输入。',
    moduleIds: ['device-ports']
  },
  {
    id: 'api-center',
    icon: 'api',
    title: 'API接口',
    step: '10 / 11',
    description: '集中管理平台开放 API、业务系统 API、Webhook 回调和凭证配置。',
    moduleIds: ['api-center', 'agent-access', 'channels']
  },
  {
    id: 'settings',
    icon: 'settings',
    title: '系统设置',
    step: '11 / 11',
    description: '集中管理界面皮肤、母菜单、容灾备份、交付入口、Hermes 指令和并行任务调度。',
    moduleIds: ['appearance', 'resilience-backup', 'hermes']
  }
];

const menuBlueprint = {
  menuSections: [
    {
      id: 'workflow-overview',
      viewId: 'target',
      title: '七维流程总控台',
      description: '总览 11 个一级入口和整体完成度。',
      children: [
        { id: 'marketing-system', viewId: 'target', title: '七维闭环', description: '查看业务流程、合规边界和系统定位。' },
        { id: 'runtime-status', viewId: 'target', title: '运行状态', description: '查看后台、知识库和本机工具状态。' }
      ]
    },
    {
      id: 'target-profile',
      viewId: 'target',
      title: '目标画像采集',
      description: '采集品牌、产品、人群、竞品、区域和媒体偏好。',
      children: [
        { id: 'target-profile-form', viewId: 'target', parentId: 'target-profile', title: '画像表单', description: '手动填写目标画像字段。' },
        { id: 'target-profile-preview', viewId: 'target', parentId: 'target-profile', title: '画像摘要', description: '生成 AI 使用口径。' }
      ]
    },
    {
      id: 'knowledge-base',
      viewId: 'content',
      title: '知识库',
      description: '维护行业知识、FAQ、处理步骤和知识图谱。',
      children: [
        { id: 'knowledge-form', viewId: 'content', parentId: 'knowledge-base', title: '知识录入', description: '新增或编辑知识条目。' },
        { id: 'knowledge-list', viewId: 'content', parentId: 'knowledge-base', title: '知识列表', description: '查看已保存知识。' }
      ]
    },
    {
      id: 'engagement-playbooks',
      viewId: 'engagement',
      title: '评论私信剧本',
      description: '沉淀评论区、私信和资料领取转化 SOP。',
      children: [
        { id: 'comment-negative', viewId: 'engagement', parentId: 'engagement-playbooks', title: '负面评论处理', description: '先安抚澄清，再转人工。' },
        { id: 'comment-positive', viewId: 'engagement', parentId: 'engagement-playbooks', title: '正向留言承接', description: '识别意向，进入私信或客服承接。' }
      ]
    },
    {
      id: 'private-message-generator',
      viewId: 'private-message',
      title: '自动私信生成器',
      description: '按来源、留言、需求和权益生成一次性私信。',
      children: [
        { id: 'private-message-scene', viewId: 'private-message', parentId: 'private-message-generator', title: '场景交代', description: '说明我是谁、在哪里看到、为什么联系。' },
        { id: 'private-message-card', viewId: 'private-message', parentId: 'private-message-generator', title: '名片卡片', description: '配置抖音、微信、企微或专有私域跳转卡片。' }
      ]
    },
    {
      id: 'private-message-approval',
      viewId: 'private-message',
      title: '私信审批队列',
      description: '发送前人工确认，避免误发和平台违规。',
      children: [
        { id: 'approval-pending', viewId: 'private-message', parentId: 'private-message-approval', title: '待审', description: '待人工确认的话术。' },
        { id: 'approval-sent', viewId: 'private-message', parentId: 'private-message-approval', title: '已发送', description: '记录已发送和归档结果。' }
      ]
    },
    {
      id: 'qa-test',
      viewId: 'ai-service',
      title: '问答测试',
      description: '用真实问题验证知识库和客服回答。',
      children: [
        { id: 'graph-box', viewId: 'ai-service', parentId: 'qa-test', title: '知识图谱', description: '查看知识节点和关系。' },
        { id: 'conversation-list', viewId: 'ai-service', parentId: 'qa-test', title: '最近消息', description: '查看模拟和真实会话记录。' }
      ]
    },
    {
      id: 'channel-ports',
      viewId: 'ai-service',
      title: '多平台客服端口',
      description: '企业微信、抖音、个人微信、小红书、快手、电商等端口规划。',
      children: [
        { id: 'readiness-hub', viewId: 'ai-service', title: '接入检查台', description: '检查真实平台联调前置条件。' },
        { id: 'channel-simulator', viewId: 'ai-service', title: '端口模拟器', description: '先用模拟消息验证统一客服引擎。' }
      ]
    },
    {
      id: 'ai-call-center',
      viewId: 'ai-service',
      title: 'AI呼叫模块',
      description: '预留 AI 外呼、呼入接待、通话摘要和人工接管流程。',
      children: [
        { id: 'ai-call-outbound', viewId: 'ai-service', parentId: 'ai-call-center', title: 'AI外呼', description: '按线索阶段生成合规外呼任务。' },
        { id: 'ai-call-summary', viewId: 'ai-service', parentId: 'ai-call-center', title: '通话摘要', description: '沉淀通话纪要、意向等级和下一步任务。' },
        { id: 'ai-call-human-handoff', viewId: 'ai-service', parentId: 'ai-call-center', title: '人工接管', description: '复杂或敏感通话转人工处理。' }
      ]
    },
    {
      id: 'customer-lifecycle',
      viewId: 'conversion',
      title: '客户生命周期',
      description: '从陌生、咨询、成交到复购的跟进路径。',
      children: [
        { id: 'growth-reply', viewId: 'conversion', title: '私域引流 1.0', description: '生成合规引流和成交话术。' },
        { id: 'high-intent-leads', viewId: 'conversion', title: '高意向线索', description: '查看线索等级和素材规则。' }
      ]
    },
    {
      id: 'input-center-methods',
      viewId: 'input-center',
      title: '统一输入中心',
      description: '手动、表格、数据库、API 统一入口；文字框旁边直接语音输入。',
      children: [
        { id: 'manual-input', viewId: 'input-center', parentId: 'input-center-methods', title: '手动输入', description: '快速录入目标、内容、私信和客服问题。' },
        { id: 'api-input', viewId: 'input-center', parentId: 'input-center-methods', title: 'API 输入', description: '由外部系统写入结构化数据。' }
      ]
    },
    {
      id: 'data-import-center',
      viewId: 'data-import',
      title: '数据导入/导出中心',
      description: '导入知识库、评论私信样本、目标画像和业务数据，也导出知识库和导入模板。',
      children: [
        { id: 'knowledge-import', viewId: 'data-import', parentId: 'data-import-center', title: '知识库导入', description: '批量导入 FAQ、案例和流程。' },
        { id: 'profile-import', viewId: 'data-import', parentId: 'data-import-center', title: '画像导入', description: '批量导入目标人群和竞品。' },
        { id: 'data-export', viewId: 'data-import', parentId: 'data-import-center', title: '数据导出', description: '导出知识库和导入模板，供人工复核或跨系统迁移。' }
      ]
    },
    {
      id: 'yunke-call-import',
      viewId: 'data-import',
      title: '人工呼叫导入云客',
      description: '把人工呼叫记录、客户意向和跟进结果导入云客模块。',
      children: [
        { id: 'yunke-call-template', viewId: 'data-import', parentId: 'yunke-call-import', title: '导入模板', description: '手机号、来源、通话结果、意向等级和跟进人字段。' },
        { id: 'yunke-call-review', viewId: 'data-import', parentId: 'yunke-call-import', title: '导入前校验', description: '去重、脱敏、授权和异常数据检查。' }
      ]
    },
    {
      id: 'crm-import',
      viewId: 'data-import',
      title: '导入到CRM系统',
      description: '把线索、客户阶段、标签和成交状态同步到 CRM。',
      children: [
        { id: 'crm-field-mapping', viewId: 'data-import', parentId: 'crm-import', title: '字段映射', description: '客户、手机号、来源、阶段、标签、跟进人和备注。' },
        { id: 'crm-sync-policy', viewId: 'data-import', parentId: 'crm-import', title: '同步策略', description: '新增、更新、去重、失败重试和审计记录。' }
      ]
    },
    {
      id: 'device-port-center',
      viewId: 'device-ports',
      title: '外设接口',
      description: '手机、平台客服终端、录音和会议输入。',
      children: [
        { id: 'wechat-device', viewId: 'device-ports', parentId: 'device-port-center', title: '微信终端', description: '个人微信、企业微信和群机器人。' },
        { id: 'voice-device', viewId: 'device-ports', parentId: 'device-port-center', title: '语音终端', description: '麦克风、通话和会议转写。' }
      ]
    },
    {
      id: 'api-overview',
      viewId: 'api-center',
      title: 'API接口中心',
      description: '平台开放 API、业务 API 和 Webhook。',
      children: [
        { id: 'api-platform-config', viewId: 'api-center', title: '平台凭证配置', description: '配置企业微信、抖音、电商等凭证。' },
        { id: 'webhook-callback', viewId: 'api-center', parentId: 'api-overview', title: 'Webhook 回调', description: '接收平台消息和业务事件。' }
      ]
    },
    {
      id: 'agent-access-center',
      viewId: 'api-center',
      title: 'Agent接入中心',
      description: '接入 Open cloud agent、Hermes agent 和自定义Agent。',
      children: [
        { id: 'open-cloud-agent', viewId: 'api-center', parentId: 'agent-access-center', title: 'Open cloud agent', description: '优先推荐，沙盒任务预览。' },
        { id: 'hermes-agent', viewId: 'api-center', parentId: 'agent-access-center', title: 'Hermes agent', description: '优先推荐，双向指令与进度回传。' },
        { id: 'custom-agent', viewId: 'api-center', parentId: 'agent-access-center', title: '自定义Agent', description: '自定义能力白名单和审计。' }
      ]
    },
    {
      id: 'appearance-settings',
      viewId: 'settings',
      title: '界面设置',
      description: '调色盘、字体、字号和母菜单颜色。',
      children: [
        { id: 'module-settings', viewId: 'settings', title: '模块管理', description: '管理一级菜单、二级板块、尺寸和锁定。' },
        { id: 'delivery-center', viewId: 'settings', title: '交付入口', description: '查看演示地址、安装包和 GitHub 仓库。' }
      ]
    },
    {
      id: 'resilience-backup-center',
      viewId: 'settings',
      title: '容灾备份中心',
      description: '时间胶囊、完整数据库、组织架构、节点协议端口和完完全全克隆机备份。',
      children: [
        { id: 'time-capsule-backup', viewId: 'settings', parentId: 'resilience-backup-center', title: '时间胶囊备份', description: '按时间点保留系统快照。' },
        { id: 'full-database-backup', viewId: 'settings', parentId: 'resilience-backup-center', title: '完整数据库备份', description: '完整保存核心业务数据。' },
        { id: 'organization-backup', viewId: 'settings', parentId: 'resilience-backup-center', title: '组织架构备份', description: '保存部门、角色、权限和审批人。' },
        { id: 'node-port-backup', viewId: 'settings', parentId: 'resilience-backup-center', title: '节点协议端口备份', description: '保存端口、协议、Webhook 和 Agent 接入口。' },
        { id: 'clone-machine-backup', viewId: 'settings', parentId: 'resilience-backup-center', title: '完完全全克隆机备份', description: '生成克隆机清单和演练计划。' }
      ]
    },
    {
      id: 'hermes-inbox',
      viewId: 'settings',
      title: 'Hermes 双向中心',
      description: '收指令、回传阻塞和进度。',
      children: [
        { id: 'orchestration-plan', viewId: 'settings', title: '并行任务调度', description: '拆分任务、合并关口和回传策略。' }
      ]
    }
  ]
};

const menuSections = menuBlueprint.menuSections;

const state = {
  knowledge: [],
  conversations: [],
  graph: { nodes: [], edges: [] },
  channelPorts: [],
  marketingSystem: null,
  projectProgress: null,
  callCrmBlueprint: null,
  callCrmBlueprintError: '',
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
  resilienceBackupBlueprint: null,
  resilienceBackupBlueprintError: '',
  agentAccessBlueprint: null,
  agentAccessBlueprintError: '',
  inputAssistCustoms: loadInputAssistCustoms(window.localStorage),
  activeSuggestionMenu: null,
  growth: {
    scripts: [],
    materials: [],
    rules: [],
    leads: []
  },
  voiceRecognition: null,
  workflowSettings: loadWorkflowSettings(window.localStorage),
  targetProfile: loadTargetProfile(window.localStorage),
  sidebarLayout: loadSidebarLayout(window.localStorage),
  menuExpansion: loadMenuExpansion(window.localStorage),
  menuSearch: ''
};

const inputModeRows = [
  ['锚定目标', '品牌、人群、区域、竞品、消费行为、媒体偏好', ['手动', '表格', '数据库', 'API', '语音']],
  ['生成内容', '知识库、知识图谱、头部内容参考、文案素材', ['手动', '表格', '数据库', 'API', '语音']],
  ['评论私信管理', '评论、私信、资料领取、负面反馈和意向分级', ['手动', '表格', '数据库', 'API', '语音']],
  ['加私信', '一次性私信、来源说明、价值钩子、权益和链接', ['手动', '表格', '数据库', 'API', '语音']],
  ['AI客服', '客户问题、平台消息、知识库答案和图谱推理', ['手动', '表格', '数据库', 'API', '语音']],
  ['引流成交', '线索阶段、成交目标、复购跟单和权益策略', ['手动', '表格', '数据库', 'API', '语音']]
];

const $ = (selector) => document.querySelector(selector);

const elements = {
  statusLine: $('#statusLine'),
  primaryNav: $('#primaryNav'),
  menuSearch: $('#menuSearchInput'),
  appSidebar: $('.app-sidebar'),
  sidebarPeekZone: $('#sidebarPeekZone'),
  sidebarSettings: $('#sidebarSettingsButton'),
  sidebarLock: $('#sidebarLockButton'),
  sidebarCollapse: $('#sidebarCollapseButton'),
  sidebarResizeHandle: $('#sidebarResizeHandle'),
  workflowTitle: $('#workflowTitle'),
  workflowDescription: $('#workflowDescription'),
  workflowStep: $('#workflowStep'),
  workflowOverviewSummary: $('#workflowOverviewSummary'),
  workflowOverviewCards: $('#workflowOverviewCards'),
  targetProfileForm: $('#targetProfileForm'),
  targetProfileSummary: $('#targetProfileSummary'),
  targetProfilePreview: $('#targetProfilePreview'),
  targetBrand: $('#targetBrandInput'),
  targetProduct: $('#targetProductInput'),
  targetSellingPoint: $('#targetSellingPointInput'),
  targetMarket: $('#targetMarketInput'),
  targetConsumerSegment: $('#targetConsumerSegmentInput'),
  targetConversionGoal: $('#targetConversionGoalInput'),
  targetAge: $('#targetAgeInput'),
  targetGender: $('#targetGenderInput'),
  targetNeedOwner: $('#targetNeedOwnerInput'),
  targetRegion: $('#targetRegionInput'),
  targetCity: $('#targetCityInput'),
  targetCompetitor: $('#targetCompetitorInput'),
  targetBehavior: $('#targetBehaviorInput'),
  targetPain: $('#targetPainInput'),
  targetMedia: $('#targetMediaInput'),
  targetContentPreference: $('#targetContentPreferenceInput'),
  resetTargetProfile: $('#resetTargetProfileButton'),
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
  sidebarColor: $('#sidebarColorInput'),
  skinColor: $('#skinColorInput'),
  backgroundColor: $('#backgroundColorInput'),
  panelColor: $('#panelColorInput'),
  textColor: $('#textColorInput'),
  fontPreset: $('#fontPresetInput'),
  customFont: $('#customFontInput'),
  fontSize: $('#fontSizeInput'),
  fontSizeNumber: $('#fontSizeNumberInput'),
  fontSizeLabel: $('#fontSizeLabel'),
  resetAppearance: $('#resetAppearanceButton'),
  moduleSettingsSummary: $('#moduleSettingsSummary'),
  moduleSettingsList: $('#moduleSettingsList'),
  resetModuleSettings: $('#resetModuleSettingsButton'),
  inputModeMatrix: $('#inputModeMatrix'),
  voiceGlobalStatus: $('#voiceGlobalStatus'),
  dataExportKnowledge: $('#dataExportKnowledgeButton'),
  dataExportTemplate: $('#dataExportTemplateButton'),
  channelPortSummary: $('#channelPortSummary'),
  readinessHubSummary: $('#readinessHubSummary'),
  readinessHub: $('#readinessHub'),
  platformConfigSummary: $('#platformConfigSummary'),
  platformConfigList: $('#platformConfigList'),
  platformConfigBox: $('#platformConfigBox'),
  integrationRoadmap: $('#integrationRoadmap'),
  channelPortList: $('#channelPortList'),
  aiCallSummary: $('#aiCallSummary'),
  aiCallBlueprint: $('#aiCallBlueprint'),
  yunkeCallImportSummary: $('#yunkeCallImportSummary'),
  yunkeCallImportBlueprint: $('#yunkeCallImportBlueprint'),
  crmImportSummary: $('#crmImportSummary'),
  crmImportBlueprint: $('#crmImportBlueprint'),
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
  privateContactCardType: $('#privateContactCardTypeInput'),
  privateContactCardTitle: $('#privateContactCardTitleInput'),
  privateContactCardDescription: $('#privateContactCardDescriptionInput'),
  privateContactCardUrl: $('#privateContactCardUrlInput'),
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
  resilienceBackupSummary: $('#resilienceBackupSummary'),
  resilienceBackupBlueprint: $('#resilienceBackupBlueprint'),
  agentAccessSummary: $('#agentAccessSummary'),
  agentAccessBlueprint: $('#agentAccessBlueprint'),
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
    sidebarColor: elements.sidebarColor,
    skinColor: elements.skinColor,
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
applySidebarLayout();
await refreshAll();

elements.refresh.addEventListener('click', refreshAll);
elements.primaryNav.addEventListener('click', handleWorkflowNavClick);
elements.primaryNav.addEventListener('dragstart', handleMenuTreeDragStart);
elements.primaryNav.addEventListener('dragover', handleMenuTreeDragOver);
elements.primaryNav.addEventListener('drop', handleMenuTreeDrop);
elements.primaryNav.addEventListener('dragend', handleMenuTreeDragEnd);
elements.menuSearch.addEventListener('input', handleMenuSearchInput);
elements.sidebarSettings.addEventListener('click', () => showWorkflowView('settings'));
elements.sidebarLock.addEventListener('click', toggleSidebarLock);
elements.sidebarCollapse.addEventListener('click', toggleSidebarMode);
elements.appSidebar.addEventListener('pointerenter', openSidebarPeek);
elements.appSidebar.addEventListener('pointerleave', scheduleSidebarAutoHide);
elements.appSidebar.addEventListener('dblclick', handleSidebarDoubleClick);
elements.sidebarPeekZone.addEventListener('pointerenter', openSidebarPeek);
elements.sidebarPeekZone.addEventListener('pointerleave', scheduleSidebarAutoHide);
elements.sidebarPeekZone.addEventListener('focus', openSidebarPeek);
elements.sidebarPeekZone.addEventListener('blur', scheduleSidebarAutoHide);
elements.sidebarPeekZone.addEventListener('click', openSidebarPeek);
elements.sidebarPeekZone.addEventListener('dblclick', handleSidebarDoubleClick);
elements.sidebarResizeHandle.addEventListener('pointerdown', startSidebarResize);
elements.targetProfileForm.addEventListener('submit', saveTargetProfile);
elements.targetProfileForm.addEventListener('input', previewTargetProfileFromForm);
elements.resetTargetProfile.addEventListener('click', resetTargetProfile);
elements.moduleSettingsList.addEventListener('change', handleWorkflowSettingsChange);
elements.moduleSettingsList.addEventListener('dragstart', handleWorkflowDragStart);
elements.moduleSettingsList.addEventListener('dragover', handleWorkflowDragOver);
elements.moduleSettingsList.addEventListener('drop', handleWorkflowDrop);
elements.moduleSettingsList.addEventListener('dragend', handleWorkflowDragEnd);
elements.resetModuleSettings.addEventListener('click', resetWorkflowSettings);
elements.dataExportKnowledge.addEventListener('click', exportLocalKnowledge);
elements.dataExportTemplate.addEventListener('click', exportKnowledgeTemplate);
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
document.addEventListener('click', handleMenuJumpClick);
document.addEventListener('click', handleInlineVoiceClick);

async function refreshAll() {
  const [
    status,
    knowledge,
    conversations,
    channelPorts,
    platformConfig,
    marketingSystem,
    projectProgress,
    callCrmBlueprintResult,
    integrationRoadmap,
    wecomReadiness,
    douyinReadiness,
    wechatPersonalReadiness,
    customerLifecycle,
    engagementPlaybooks,
    hermesCommands,
    privateMessageApprovals,
    orchestrationPlanResult,
    resilienceBackupResult,
    agentAccessResult
  ] = await Promise.all([
    api('/api/status'),
    api('/api/knowledge'),
    api('/api/conversations'),
    api('/api/channel-ports'),
    api('/api/platform-config'),
    api('/api/marketing-system'),
    api('/api/project-progress'),
    optionalApi('/api/call-crm-blueprint'),
    api('/api/integration-roadmap'),
    api('/api/wecom/readiness'),
    api('/api/douyin/readiness'),
    api('/api/wechat-personal/readiness'),
    api('/api/customer-lifecycle'),
    api('/api/engagement-playbooks'),
    api('/api/hermes/commands'),
    api('/api/private-message/approvals'),
    optionalApi('/api/orchestration-plan'),
    optionalApi('/api/resilience-backup-blueprint'),
    optionalApi('/api/agent-access-blueprint')
  ]);

  state.knowledge = knowledge;
  state.conversations = conversations;
  state.channelPorts = channelPorts;
  state.platformConfig = platformConfig;
  state.marketingSystem = marketingSystem;
  state.projectProgress = projectProgress;
  state.callCrmBlueprint = callCrmBlueprintResult.data;
  state.callCrmBlueprintError = callCrmBlueprintResult.error;
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
  state.resilienceBackupBlueprint = resilienceBackupResult.data;
  state.resilienceBackupBlueprintError = resilienceBackupResult.error;
  state.agentAccessBlueprint = agentAccessResult.data;
  state.agentAccessBlueprintError = agentAccessResult.error;
  state.graph = await api('/api/knowledge-graph');
  state.growth = {
    scripts: await api('/api/growth/scripts'),
    materials: await api('/api/growth/materials'),
    rules: await api('/api/growth/rules'),
    leads: await api('/api/growth/leads')
  };
  renderWorkflowMenu();
  renderModuleSettings();
  applyPanelLayoutSettings();
  renderInputModeMatrix();
  renderTargetProfile();
  renderStatus(status);
  renderProgressBadges();
  applyPanelLayoutSettings();
  renderWorkflowOverview();
  renderKnowledge();
  renderGraph();
  renderIntegrationRoadmap();
  renderReadinessHub();
  renderPlatformConfig();
  renderCallCrmBlueprint();
  renderChannelPorts(status.channelPorts);
  renderChannelSelect();
  renderMarketingSystem();
  renderCustomerLifecycle();
  renderEngagementPlaybooks();
  renderHermesCommands();
  renderPrivateApprovals();
  renderOrchestrationPlan();
  renderResilienceBackupBlueprint();
  renderAgentAccessBlueprint();
  renderConversations();
  renderGrowth();
  enhanceVoiceInputControls();
  showWorkflowView(currentWorkflowFromHash(), { updateHash: false });
}

function initializeWorkflowMenu() {
  renderWorkflowMenu();
  showWorkflowView(currentWorkflowFromHash(), { updateHash: false });
}

function handleWorkflowNavClick(event) {
  const viewToggle = event.target.closest('[data-menu-toggle-view]');
  if (viewToggle) {
    event.preventDefault();
    toggleMenuView(viewToggle.dataset.menuToggleView);
    return;
  }

  const sectionToggle = event.target.closest('[data-menu-toggle-section]');
  if (sectionToggle) {
    event.preventDefault();
    toggleMenuSection(sectionToggle.dataset.menuToggleSection);
    return;
  }

  const sectionButton = event.target.closest('[data-menu-section-target]');
  if (sectionButton) {
    handleMenuSectionClick(sectionButton);
    return;
  }

  const button = event.target.closest('[data-workflow-tab]');
  if (!button) {
    return;
  }
  showWorkflowView(button.dataset.workflowTab);
}

function handleMenuSearchInput(event) {
  state.menuSearch = normalizeSearchText(event.target.value);
  renderWorkflowMenu();
}

function currentWorkflowFromHash() {
  const hash = decodeURIComponent(window.location.hash || '').replace(/^#/, '');
  if (visibleWorkflowViews().some((view) => view.id === hash)) {
    return hash;
  }
  return visibleWorkflowViews()[0]?.id || workflowViews[0].id;
}

function showWorkflowView(viewId, { updateHash = true } = {}) {
  const views = visibleWorkflowViews();
  const view = views.find((item) => item.id === viewId) || views[0] || workflowViews[0];
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

function handleMenuSectionClick(button) {
  const sectionId = button.dataset.menuSectionTarget;
  const section = findMenuSection(sectionId);
  const viewId = button.dataset.workflowTab || effectiveSectionViewId(section) || section?.viewId;
  showWorkflowView(viewId);
  scrollToMenuSection(sectionId);
}

function handleMenuJumpClick(event) {
  const button = event.target.closest('[data-menu-jump]');
  if (!button) {
    return;
  }
  event.preventDefault();
  jumpToMenuSection(button.dataset.menuJump, button.dataset.workflowTarget);
}

function jumpToMenuSection(sectionId, preferredViewId) {
  const section = findMenuSection(sectionId);
  const viewId = preferredViewId || effectiveSectionViewId(section) || section?.viewId;
  if (viewId) {
    showWorkflowView(viewId);
  }
  scrollToMenuSection(sectionId);
}

function scrollToMenuSection(sectionId) {
  const section = findMenuSection(sectionId);
  const targetId = document.querySelector(`[data-menu-section="${cssEscape(sectionId)}"]`)
    ? sectionId
    : section?.parentId || section?.id;
  const target = targetId ? document.querySelector(`[data-menu-section="${cssEscape(targetId)}"]`) : null;
  if (!target) {
    return;
  }
  target.classList.add('menu-section-highlight');
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => target.classList.remove('menu-section-highlight'), 1200);
}

function renderWorkflowMenu() {
  const views = filteredWorkflowViews();
  elements.primaryNav.innerHTML = views.length ? views.map((view) => {
    const summary = workflowMenuSummary(view);
    const sections = orderedMenuSections().filter((section) => effectiveSectionViewId(section) === view.id);
    const expanded = isMenuExpanded(`view:${view.id}`);
    return `
      <section class="workflow-menu-group" data-menu-group="${escapeHtml(view.id)}" data-menu-drag-id="view:${escapeHtml(view.id)}" draggable="true">
        <div class="workflow-menu-primary-row">
        <button type="button" class="workflow-menu-primary" data-workflow-tab="${escapeHtml(view.id)}" data-menu-tone="${escapeHtml(summary.tone)}" title="${escapeHtml(summary.title)}" aria-expanded="${expanded}">
          ${renderWorkflowLogo(view)}
          <span class="menu-copy">
            <span class="menu-title">${escapeHtml(view.title)}</span>
            <span class="menu-meta">${escapeHtml(summary.meta)}</span>
          </span>
        </button>
          <button type="button" class="menu-expand-button" data-menu-toggle-view="${escapeHtml(view.id)}" aria-expanded="${expanded}" title="${expanded ? '收起菜单' : '展开菜单'}">
            <span class="menu-expand-indicator">${expanded ? '⌃' : '⌄'}</span>
          </button>
        </div>
        ${sections.length && expanded ? `
          <div class="workflow-submenu">
            ${sections.map((section) => renderWorkflowSubmenu(section, view.id)).join('')}
          </div>
        ` : ''}
      </section>
    `;
  }).join('') : '<div class="menu-empty">没有匹配菜单</div>';
}

function renderWorkflowSubmenu(section, viewId) {
  const children = orderedSectionChildren(section).filter((child) => workflowSectionMatchesSearch(child));
  const expanded = isMenuExpanded(`section:${section.id}`);
  return `
    <div class="workflow-submenu-item" data-menu-drag-id="section:${escapeHtml(section.id)}" draggable="${state.workflowSettings.sectionLocks?.[section.id] ? 'false' : 'true'}">
      <div class="workflow-submenu-row">
      <button type="button" class="workflow-submenu-button" data-menu-section-target="${escapeHtml(section.id)}" data-workflow-tab="${escapeHtml(viewId)}" title="${escapeHtml(section.description || section.title)}" aria-expanded="${expanded}">
        <span>${escapeHtml(section.title)}</span>
      </button>
        <button type="button" class="menu-expand-button small" data-menu-toggle-section="${escapeHtml(section.id)}" aria-expanded="${expanded}" title="${expanded ? '收起二级菜单' : '展开二级菜单'}">
          <span class="menu-expand-indicator">${expanded ? '⌃' : '⌄'}</span>
        </button>
      </div>
      ${children.length && expanded ? `
        <div class="workflow-tertiary-menu">
          ${children.map((child) => `
            <button type="button" data-child-module-id="${escapeHtml(child.id)}" data-menu-drag-id="child:${escapeHtml(section.id)}:${escapeHtml(child.id)}" draggable="${state.workflowSettings.childLocks?.[child.id] ? 'false' : 'true'}" data-menu-section-target="${escapeHtml(child.id)}" data-workflow-tab="${escapeHtml(effectiveSectionViewId(section))}" title="${escapeHtml(child.description || child.title)}">
              ${escapeHtml(child.title)}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderWorkflowLogo(view) {
  const icons = {
    target: '<circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 3v3M12 18v3M3 12h3M18 12h3"></path>',
    content: '<path d="M6 4h9l3 3v13H6z"></path><path d="M14 4v4h4"></path><path d="M8.5 11h7M8.5 15h5"></path>',
    chat: '<path d="M5 6.5h14v9H9l-4 3z"></path><path d="M8.5 10h7M8.5 13h4"></path>',
    message: '<path d="M4 6h16v12H4z"></path><path d="m4 7 8 6 8-6"></path>',
    service: '<path d="M5 12a7 7 0 0 1 14 0"></path><path d="M5 12v4h3v-4zM16 12v4h3v-4z"></path><path d="M16 18h-3"></path>',
    deal: '<path d="M7 13l3 3 7-8"></path><path d="M5 5h14v14H5z"></path>',
    input: '<path d="M5 6h14v12H5z"></path><path d="M8 10h8M8 14h5"></path><path d="M17 9l2 2-2 2"></path>',
    data: '<ellipse cx="12" cy="6" rx="6" ry="3"></ellipse><path d="M6 6v6c0 1.7 2.7 3 6 3s6-1.3 6-3V6"></path><path d="M6 12v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4"></path>',
    device: '<rect x="7" y="3" width="10" height="18" rx="2"></rect><path d="M11 18h2"></path><path d="M9 6h6"></path>',
    api: '<path d="M8 8 4 12l4 4"></path><path d="m16 8 4 4-4 4"></path><path d="m14 5-4 14"></path>',
    settings: '<circle cx="12" cy="12" r="3"></circle><path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M19.8 7.5 17.2 9M6.8 15l-2.6 1.5"></path>'
  };
  const icon = icons[view.icon] || icons.target;
  return `<span class="menu-logo" data-menu-icon="${escapeHtml(view.icon || 'target')}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icon}</svg></span>`;
}

function orderedWorkflowViews() {
  const order = state.workflowSettings.order || workflowViews.map((view) => view.id);
  const byId = new Map(workflowViews.map((view) => [view.id, view]));
  const ordered = order.map((id) => byId.get(id)).filter(Boolean);
  const missing = workflowViews.filter((view) => !order.includes(view.id));
  return [...ordered, ...missing];
}

function visibleWorkflowViews() {
  const hidden = new Set(state.workflowSettings.hidden || []);
  return orderedWorkflowViews().filter((view) => !hidden.has(view.id));
}

function filteredWorkflowViews() {
  const query = state.menuSearch;
  if (!query) {
    return visibleWorkflowViews();
  }
  return visibleWorkflowViews().filter((view) => {
    const sections = orderedMenuSections().filter((section) => effectiveSectionViewId(section) === view.id);
    return workflowSearchText(view).includes(query) || sections.some((section) => workflowSectionMatchesSearch(section));
  });
}

function workflowSearchText(view) {
  return normalizeSearchText([view.title, view.description, view.id, ...(view.moduleIds || [])].join(' '));
}

function workflowSectionMatchesSearch(section) {
  const query = state.menuSearch;
  if (!query) {
    return true;
  }
  return normalizeSearchText([
    section.id,
    section.title,
    section.description,
    ...(section.children || []).flatMap((child) => [child.id, child.title, child.description])
  ].join(' ')).includes(query);
}

function normalizeSearchText(value) {
  return String(value || '').trim().toLowerCase();
}

function cssEscape(value) {
  if (window.CSS?.escape) {
    return window.CSS.escape(String(value));
  }
  return String(value).replace(/["\\]/g, '\\$&');
}

function renderModuleSettings() {
  const hidden = new Set(state.workflowSettings.hidden || []);
  const ordered = orderedWorkflowViews();
  const visibleCount = ordered.filter((view) => !hidden.has(view.id)).length;
  const sections = orderedMenuSections();
  const lockedCount = Object.values(state.workflowSettings.sectionLocks || {}).filter(Boolean).length;
  elements.moduleSettingsSummary.textContent = `${visibleCount}/${ordered.length} 一级显示 · ${sections.length} 个二级页面板块 · ${lockedCount} 个已锁定`;
  const primaryCards = ordered.map((view, index) => {
    const summary = workflowMenuSummary(view);
    const isHidden = hidden.has(view.id);
    return `
      <article class="module-setting-card ${isHidden ? 'is-hidden' : ''}" draggable="true" data-workflow-module-id="${escapeHtml(view.id)}">
        <span class="drag-handle" title="拖拽排序">↕</span>
        <div>
          <h3>${escapeHtml(index + 1)}. ${escapeHtml(view.title)}</h3>
          <p>${escapeHtml(view.description)}</p>
          <small>${escapeHtml(summary.meta)} · 下一步：${escapeHtml(summary.title.split('下一步：')[1] || '-')}</small>
        </div>
        <label class="module-visible-toggle">
          <input type="checkbox" data-workflow-visible="${escapeHtml(view.id)}" ${isHidden ? '' : 'checked'} />
          显示
        </label>
      </article>
    `;
  }).join('');

  const sectionCards = sections.map((section, index) => renderSectionSettingCard(section, index)).join('');
  elements.moduleSettingsList.innerHTML = `
    <div class="module-settings-group">
      <h3>一级菜单</h3>
      <div class="module-settings-stack">${primaryCards}</div>
    </div>
    <div class="module-settings-group">
      <h3>二级页面板块</h3>
      <div class="module-settings-stack">${sectionCards}</div>
    </div>
  `;
}

function renderSectionSettingCard(section, index) {
  const parentId = effectiveSectionViewId(section);
  const size = state.workflowSettings.sectionSizes?.[section.id] || 'normal';
  const locked = Boolean(state.workflowSettings.sectionLocks?.[section.id]);
  const children = orderedSectionChildren(section);
  return `
    <article class="module-setting-card section-setting-card ${locked ? 'is-locked' : ''}" draggable="${locked ? 'false' : 'true'}" data-section-module-id="${escapeHtml(section.id)}">
      <span class="drag-handle" title="拖拽排序">↕</span>
      <div>
        <h3>${escapeHtml(index + 1)}. ${escapeHtml(section.title)}</h3>
        <p>${escapeHtml(section.description || '页面板块')}</p>
        <small>三级菜单：${escapeHtml(children.map((child) => child.title).join(' / ') || '无')}</small>
        ${children.length ? `
          <div class="child-setting-list">
            ${children.map((child) => `
              <label class="child-setting-row" data-child-module-id="${escapeHtml(child.id)}">
                <span>${escapeHtml(child.title)}</span>
                <input type="checkbox" data-child-lock="${escapeHtml(child.id)}" ${state.workflowSettings.childLocks?.[child.id] ? 'checked' : ''} />
                锁定
              </label>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="section-setting-controls">
        <label>
          所属一级
          <select data-section-parent="${escapeHtml(section.id)}" ${locked ? 'disabled' : ''}>
            ${workflowViews.map((view) => `<option value="${escapeHtml(view.id)}" ${parentId === view.id ? 'selected' : ''}>${escapeHtml(view.title)}</option>`).join('')}
          </select>
        </label>
        <label>
          尺寸
          <select data-section-size="${escapeHtml(section.id)}" ${locked ? 'disabled' : ''}>
            <option value="normal" ${size === 'normal' ? 'selected' : ''}>默认</option>
            <option value="wide" ${size === 'wide' ? 'selected' : ''}>变宽</option>
            <option value="tall" ${size === 'tall' ? 'selected' : ''}>变长</option>
            <option value="large" ${size === 'large' ? 'selected' : ''}>等比例放大</option>
            <option value="compact" ${size === 'compact' ? 'selected' : ''}>缩小</option>
          </select>
        </label>
        <label class="module-visible-toggle">
          <input type="checkbox" data-section-lock="${escapeHtml(section.id)}" ${locked ? 'checked' : ''} />
          锁定
        </label>
      </div>
    </article>
  `;
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

function renderWorkflowOverview() {
  const modules = state.projectProgress?.modules || [];
  const summary = state.projectProgress?.summary;
  if (!modules.length) {
    elements.workflowOverviewSummary.textContent = '流程数据加载中';
    elements.workflowOverviewCards.innerHTML = '<div class="empty">正在读取七维流程进度。</div>';
    return;
  }

  elements.workflowOverviewSummary.textContent = summary
    ? `${summary.percentText} · 剩余 ${Number(summary.remainingHours || 0).toFixed(1)} 小时 · ${summary.reportCountdownText}`
    : `${modules.length} 个模块`;

  elements.workflowOverviewCards.innerHTML = visibleWorkflowViews().map((view) => {
    const viewModules = workflowModules(view);
    const average = viewModules.length
      ? viewModules.reduce((sum, module) => sum + module.percent, 0) / viewModules.length
      : 0;
    const remaining = viewModules.reduce((sum, module) => sum + module.remainingHours, 0);
    const paused = viewModules.filter((module) => module.tone === 'paused');
    const ahead = viewModules.filter((module) => module.tone === 'ahead');
    const tone = paused.length ? 'paused' : ahead.length === viewModules.length && ahead.length ? 'ahead' : 'normal';
    const leadModule = paused[0] || viewModules.find((module) => module.remainingHours > 0) || viewModules[0];
    const relatedNames = viewModules.map((module) => module.title).join(' / ') || '待接入模块';

    return `
      <button type="button" class="workflow-overview-card ${escapeHtml(tone)}" data-workflow-jump="${escapeHtml(view.id)}">
        <span class="workflow-overview-step">${escapeHtml(workflowStepNumber(view.step))}</span>
        <span class="workflow-overview-copy">
          <strong>${escapeHtml(view.title)}</strong>
          <em>${escapeHtml(view.description)}</em>
          <small>${escapeHtml(relatedNames)}</small>
        </span>
        <span class="workflow-overview-progress">
          <b>${escapeHtml(formatProgressPercent(average))}</b>
          <small>倒计时 ${escapeHtml(`${remaining.toFixed(1)} 小时`)}</small>
          <small>下一步：${escapeHtml(leadModule?.nextStep || '等待加载')}</small>
        </span>
      </button>
    `;
  }).join('');

  elements.workflowOverviewCards.querySelectorAll('[data-workflow-jump]').forEach((button) => {
    button.addEventListener('click', () => showWorkflowView(button.dataset.workflowJump));
  });
}

function loadWorkflowSettings(storage) {
  const defaults = defaultWorkflowSettings();
  if (!storage) {
    return defaults;
  }
  try {
    return normalizeWorkflowSettings(JSON.parse(storage.getItem(workflowSettingsStorageKey) || '{}'));
  } catch {
    return defaults;
  }
}

function saveWorkflowSettings() {
  state.workflowSettings = normalizeWorkflowSettings(state.workflowSettings);
  window.localStorage?.setItem(workflowSettingsStorageKey, JSON.stringify(state.workflowSettings));
  renderWorkflowMenu();
  renderWorkflowOverview();
  renderModuleSettings();
  applyPanelLayoutSettings();
  if (!visibleWorkflowViews().some((view) => view.id === currentWorkflowFromHash())) {
    showWorkflowView(visibleWorkflowViews()[0]?.id || workflowViews[0].id);
  }
}

function defaultWorkflowSettings() {
  return {
    order: workflowViews.map((view) => view.id),
    hidden: [],
    sectionOrder: menuSections.map((section) => section.id),
    sectionParents: {},
    sectionSizes: {},
    sectionLocks: {},
    childOrder: {},
    childLocks: {}
  };
}

function normalizeWorkflowSettings(input = {}) {
  const validIds = workflowViews.map((view) => view.id);
  const validSectionIds = menuSections.map((section) => section.id);
  const order = Array.isArray(input.order)
    ? input.order.filter((id, index, array) => validIds.includes(id) && array.indexOf(id) === index)
    : [];
  const hidden = Array.isArray(input.hidden)
    ? input.hidden.filter((id, index, array) => validIds.includes(id) && array.indexOf(id) === index)
    : [];
  const sectionOrder = Array.isArray(input.sectionOrder)
    ? input.sectionOrder.filter((id, index, array) => validSectionIds.includes(id) && array.indexOf(id) === index)
    : [];
  const sectionParents = normalizeSectionRecord(input.sectionParents, (value) => validIds.includes(value));
  const sectionSizes = normalizeSectionRecord(input.sectionSizes, (value) => ['normal', 'wide', 'tall', 'large', 'compact'].includes(value));
  const sectionLocks = normalizeSectionRecord(input.sectionLocks, (value) => value === true);
  const childOrder = normalizeChildOrderRecord(input.childOrder);
  const childLocks = normalizeChildLockRecord(input.childLocks);
  const mergedOrder = [...order, ...validIds.filter((id) => !order.includes(id))];
  const mergedSectionOrder = [...sectionOrder, ...validSectionIds.filter((id) => !sectionOrder.includes(id))];
  const visibleIds = validIds.filter((id) => !hidden.includes(id));
  return {
    order: mergedOrder,
    hidden: visibleIds.length ? hidden : [],
    sectionOrder: mergedSectionOrder,
    sectionParents,
    sectionSizes,
    sectionLocks,
    childOrder,
    childLocks
  };
}

function normalizeSectionRecord(input, isValidValue) {
  if (!input || typeof input !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(input)
      .filter(([id, value]) => menuSections.some((section) => section.id === id) && isValidValue(value))
  );
}

function flattenMenuSections(sections = menuSections) {
  return sections.flatMap((section) => [section, ...flattenMenuSections(section.children || [])]);
}

function orderedMenuSections() {
  const order = state.workflowSettings.sectionOrder || menuSections.map((section) => section.id);
  const byId = new Map(menuSections.map((section) => [section.id, section]));
  const ordered = order.map((id) => byId.get(id)).filter(Boolean);
  const missing = menuSections.filter((section) => !order.includes(section.id));
  return [...ordered, ...missing];
}

function orderedSectionChildren(section = {}) {
  const children = Array.isArray(section.children) ? section.children : [];
  const order = state.workflowSettings.childOrder?.[section.id] || children.map((child) => child.id);
  const byId = new Map(children.map((child) => [child.id, child]));
  const ordered = order.map((id) => byId.get(id)).filter(Boolean);
  const missing = children.filter((child) => !order.includes(child.id));
  return [...ordered, ...missing];
}

function findMenuSection(sectionId) {
  return flattenMenuSections().find((section) => section.id === sectionId);
}

function effectiveSectionViewId(section) {
  if (!section) {
    return '';
  }
  return state.workflowSettings.sectionParents?.[section.id] || section.viewId;
}

function handleWorkflowSettingsChange(event) {
  if (handleSectionSettingsChange(event)) {
    return;
  }

  const input = event.target.closest('[data-workflow-visible]');
  if (!input) {
    return;
  }
  const id = input.dataset.workflowVisible;
  const hidden = new Set(state.workflowSettings.hidden || []);
  if (input.checked) {
    hidden.delete(id);
  } else {
    hidden.add(id);
  }
  state.workflowSettings.hidden = [...hidden];
  saveWorkflowSettings();
}

function handleSectionSettingsChange(event) {
  const parentInput = event.target.closest('[data-section-parent]');
  if (parentInput) {
    const id = parentInput.dataset.sectionParent;
    const section = findMenuSection(id);
    if (section) {
      state.workflowSettings.sectionParents = {
        ...(state.workflowSettings.sectionParents || {}),
        [id]: parentInput.value
      };
      saveWorkflowSettings();
    }
    return true;
  }

  const sizeInput = event.target.closest('[data-section-size]');
  if (sizeInput) {
    const id = sizeInput.dataset.sectionSize;
    state.workflowSettings.sectionSizes = {
      ...(state.workflowSettings.sectionSizes || {}),
      [id]: sizeInput.value
    };
    saveWorkflowSettings();
    return true;
  }

  const lockInput = event.target.closest('[data-section-lock]');
  if (lockInput) {
    const id = lockInput.dataset.sectionLock;
    state.workflowSettings.sectionLocks = {
      ...(state.workflowSettings.sectionLocks || {}),
      [id]: lockInput.checked
    };
    saveWorkflowSettings();
    return true;
  }

  const childLockInput = event.target.closest('[data-child-lock]');
  if (childLockInput) {
    const id = childLockInput.dataset.childLock;
    state.workflowSettings.childLocks = {
      ...(state.workflowSettings.childLocks || {}),
      [id]: childLockInput.checked
    };
    saveWorkflowSettings();
    return true;
  }

  return false;
}

function handleWorkflowDragStart(event) {
  const card = event.target.closest('[data-workflow-module-id]');
  const sectionCard = event.target.closest('[data-section-module-id]');
  if (!card && !sectionCard) {
    return;
  }
  if (sectionCard && state.workflowSettings.sectionLocks?.[sectionCard.dataset.sectionModuleId]) {
    event.preventDefault();
    return;
  }
  const source = card || sectionCard;
  source.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', card ? `view:${card.dataset.workflowModuleId}` : `section:${sectionCard.dataset.sectionModuleId}`);
}

function handleWorkflowDragOver(event) {
  if (event.target.closest('[data-workflow-module-id], [data-section-module-id]')) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleWorkflowDrop(event) {
  const targetView = event.target.closest('[data-workflow-module-id]');
  const targetSection = event.target.closest('[data-section-module-id]');
  const source = event.dataTransfer.getData('text/plain');
  if (!source || (!targetView && !targetSection)) {
    return;
  }
  event.preventDefault();

  if (source.startsWith('section:') && targetSection) {
    reorderSection(source.replace('section:', ''), targetSection.dataset.sectionModuleId);
    return;
  }

  if (!source.startsWith('view:') || !targetView) {
    return;
  }

  const sourceId = source.replace('view:', '');
  if (sourceId === targetView.dataset.workflowModuleId) {
    return;
  }
  const order = orderedWorkflowViews().map((view) => view.id);
  const fromIndex = order.indexOf(sourceId);
  const toIndex = order.indexOf(targetView.dataset.workflowModuleId);
  if (fromIndex < 0 || toIndex < 0) {
    return;
  }
  order.splice(fromIndex, 1);
  order.splice(toIndex, 0, sourceId);
  state.workflowSettings.order = order;
  saveWorkflowSettings();
}

function reorderSection(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId || state.workflowSettings.sectionLocks?.[sourceId]) {
    return;
  }

  const order = orderedMenuSections().map((section) => section.id);
  const fromIndex = order.indexOf(sourceId);
  const toIndex = order.indexOf(targetId);
  if (fromIndex < 0 || toIndex < 0) {
    return;
  }
  order.splice(fromIndex, 1);
  order.splice(toIndex, 0, sourceId);
  state.workflowSettings.sectionOrder = order;
  saveWorkflowSettings();
}

function reorderChildSection(parentId, sourceId, targetId) {
  if (!parentId || !sourceId || !targetId || sourceId === targetId || state.workflowSettings.childLocks?.[sourceId]) {
    return;
  }
  const parent = menuSections.find((section) => section.id === parentId);
  if (!parent) {
    return;
  }
  const order = orderedSectionChildren(parent).map((child) => child.id);
  const fromIndex = order.indexOf(sourceId);
  const toIndex = order.indexOf(targetId);
  if (fromIndex < 0 || toIndex < 0) {
    return;
  }
  order.splice(fromIndex, 1);
  order.splice(toIndex, 0, sourceId);
  state.workflowSettings.childOrder = {
    ...(state.workflowSettings.childOrder || {}),
    [parentId]: order
  };
  saveWorkflowSettings();
}

function handleWorkflowDragEnd() {
  elements.moduleSettingsList.querySelectorAll('.dragging').forEach((card) => card.classList.remove('dragging'));
}

function handleMenuTreeDragStart(event) {
  const item = event.target.closest('[data-menu-drag-id]');
  if (!item) {
    return;
  }
  const dragId = item.dataset.menuDragId;
  if (dragId.startsWith('section:') && state.workflowSettings.sectionLocks?.[dragId.replace('section:', '')]) {
    event.preventDefault();
    return;
  }
  if (dragId.startsWith('child:')) {
    const childId = dragId.split(':')[2];
    if (state.workflowSettings.childLocks?.[childId]) {
      event.preventDefault();
      return;
    }
  }
  item.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', dragId);
}

function handleMenuTreeDragOver(event) {
  if (event.target.closest('[data-menu-drag-id]')) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleMenuTreeDrop(event) {
  const target = event.target.closest('[data-menu-drag-id]');
  const source = event.dataTransfer.getData('text/plain');
  if (!target || !source) {
    return;
  }
  event.preventDefault();
  const targetId = target.dataset.menuDragId;
  if (source.startsWith('view:') && targetId.startsWith('view:')) {
    reorderWorkflowView(source.replace('view:', ''), targetId.replace('view:', ''));
    return;
  }
  if (source.startsWith('section:') && targetId.startsWith('section:')) {
    reorderSection(source.replace('section:', ''), targetId.replace('section:', ''));
    return;
  }
  if (source.startsWith('child:') && targetId.startsWith('child:')) {
    const [, sourceParent, sourceChild] = source.split(':');
    const [, targetParent, targetChild] = targetId.split(':');
    if (sourceParent === targetParent) {
      reorderChildSection(sourceParent, sourceChild, targetChild);
    }
  }
}

function handleMenuTreeDragEnd() {
  elements.primaryNav.querySelectorAll('.dragging').forEach((item) => item.classList.remove('dragging'));
}

function reorderWorkflowView(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) {
    return;
  }
  const order = orderedWorkflowViews().map((view) => view.id);
  const fromIndex = order.indexOf(sourceId);
  const toIndex = order.indexOf(targetId);
  if (fromIndex < 0 || toIndex < 0) {
    return;
  }
  order.splice(fromIndex, 1);
  order.splice(toIndex, 0, sourceId);
  state.workflowSettings.order = order;
  saveWorkflowSettings();
}

function resetWorkflowSettings() {
  state.workflowSettings = defaultWorkflowSettings();
  saveWorkflowSettings();
  showWorkflowView(workflowViews[0].id);
}

function loadMenuExpansion(storage) {
  const defaults = defaultMenuExpansion();
  if (!storage) {
    return defaults;
  }
  try {
    return normalizeMenuExpansion(JSON.parse(storage.getItem(menuExpansionStorageKey) || '{}'));
  } catch {
    return defaults;
  }
}

function defaultMenuExpansion() {
  return {
    expanded: [
      ...workflowViews.map((view) => `view:${view.id}`),
      ...menuSections.map((section) => `section:${section.id}`)
    ]
  };
}

function normalizeMenuExpansion(input = {}) {
  const allowed = new Set(defaultMenuExpansion().expanded);
  const expanded = Array.isArray(input.expanded)
    ? input.expanded.filter((id, index, array) => allowed.has(id) && array.indexOf(id) === index)
    : defaultMenuExpansion().expanded;
  return { expanded };
}

function isMenuExpanded(id) {
  return new Set(state.menuExpansion.expanded || []).has(id);
}

function saveMenuExpansion() {
  state.menuExpansion = normalizeMenuExpansion(state.menuExpansion);
  window.localStorage?.setItem(menuExpansionStorageKey, JSON.stringify(state.menuExpansion));
  renderWorkflowMenu();
}

function toggleMenuView(viewId) {
  toggleMenuExpansion(`view:${viewId}`);
}

function toggleMenuSection(sectionId) {
  toggleMenuExpansion(`section:${sectionId}`);
}

function toggleMenuExpansion(id) {
  const expanded = new Set(state.menuExpansion.expanded || []);
  if (expanded.has(id)) {
    expanded.delete(id);
  } else {
    expanded.add(id);
  }
  state.menuExpansion.expanded = [...expanded];
  saveMenuExpansion();
}

function normalizeChildOrderRecord(input) {
  if (!input || typeof input !== 'object') {
    return {};
  }
  const entries = Object.entries(input).flatMap(([parentId, childIds]) => {
    const parent = menuSections.find((section) => section.id === parentId);
    if (!parent || !Array.isArray(childIds)) {
      return [];
    }
    const validIds = (parent.children || []).map((child) => child.id);
    const order = childIds.filter((id, index, array) => validIds.includes(id) && array.indexOf(id) === index);
    return order.length ? [[parentId, [...order, ...validIds.filter((id) => !order.includes(id))]]] : [];
  });
  return Object.fromEntries(entries);
}

function normalizeChildLockRecord(input) {
  if (!input || typeof input !== 'object') {
    return {};
  }
  const validChildIds = new Set(menuSections.flatMap((section) => (section.children || []).map((child) => child.id)));
  return Object.fromEntries(
    Object.entries(input).filter(([id, value]) => validChildIds.has(id) && value === true)
  );
}

function applyPanelLayoutSettings() {
  const settings = normalizeWorkflowSettings(state.workflowSettings);
  state.workflowSettings = settings;
  document.querySelectorAll('[data-menu-section]').forEach((panel) => {
    const sectionId = panel.dataset.menuSection;
    const size = settings.sectionSizes[sectionId] || 'normal';
    const locked = Boolean(settings.sectionLocks[sectionId]);
    panel.classList.remove('panel-size-normal', 'panel-size-wide', 'panel-size-tall', 'panel-size-large', 'panel-size-compact', 'panel-locked');
    panel.classList.add(`panel-size-${size}`);
    panel.classList.toggle('panel-locked', locked);
  });
}

function loadSidebarLayout(storage) {
  const defaults = defaultSidebarLayout();
  if (!storage) {
    return defaults;
  }
  try {
    return normalizeSidebarLayout(JSON.parse(storage.getItem(sidebarLayoutStorageKey) || '{}'));
  } catch {
    return defaults;
  }
}

function defaultSidebarLayout() {
  return {
    locked: true,
    collapsed: true,
    mode: 'auto-hide',
    width: 208
  };
}

function normalizeSidebarLayout(input = {}) {
  const mode = input.mode === 'fixed' ? 'fixed' : 'auto-hide';
  return {
    locked: input.locked !== false,
    collapsed: mode === 'auto-hide',
    mode,
    width: clampSidebarWidth(input.width)
  };
}

function saveSidebarLayout() {
  state.sidebarLayout = normalizeSidebarLayout(state.sidebarLayout);
  window.localStorage?.setItem(sidebarLayoutStorageKey, JSON.stringify(state.sidebarLayout));
  applySidebarLayout();
}

function applySidebarLayout() {
  const layout = normalizeSidebarLayout(state.sidebarLayout);
  const isAutoHide = layout.mode === 'auto-hide';
  state.sidebarLayout = layout;
  document.documentElement.style.setProperty('--sidebar-panel-width', `${layout.width}px`);
  document.documentElement.style.setProperty('--sidebar-width', isAutoHide ? '0px' : `${layout.width}px`);
  document.body.classList.toggle('sidebar-auto-hide', isAutoHide);
  document.body.classList.toggle('sidebar-pinned', !isAutoHide);
  document.body.classList.toggle('sidebar-unlocked', !layout.locked && !isAutoHide);
  document.body.classList.toggle('menu-layout-editing', !layout.locked && !isAutoHide);
  document.body.classList.remove('sidebar-collapsed');
  if (!isAutoHide) {
    clearSidebarAutoHideTimer();
    document.body.classList.remove('sidebar-peeking');
  }
  elements.sidebarLock.setAttribute('aria-pressed', String(layout.locked));
  elements.sidebarLock.textContent = layout.locked ? '🔒' : '🔓';
  elements.sidebarLock.title = layout.locked ? '解锁菜单布局' : '锁定菜单布局';
  elements.sidebarLock.setAttribute('aria-label', elements.sidebarLock.title);
  elements.sidebarCollapse.setAttribute('aria-pressed', String(isAutoHide));
  elements.sidebarCollapse.textContent = isAutoHide ? '📌' : '⇤';
  elements.sidebarCollapse.title = isAutoHide ? '固定显示菜单' : '解除固定，自动隐藏菜单';
  elements.sidebarCollapse.setAttribute('aria-label', elements.sidebarCollapse.title);
  elements.sidebarPeekZone.setAttribute('aria-hidden', String(!isAutoHide));
  elements.sidebarPeekZone.tabIndex = isAutoHide ? 0 : -1;
}

function toggleSidebarLock() {
  state.sidebarLayout.locked = !state.sidebarLayout.locked;
  saveSidebarLayout();
}

function toggleSidebarCollapse() {
  toggleSidebarMode();
}

function toggleSidebarMode() {
  const layout = normalizeSidebarLayout(state.sidebarLayout);
  setSidebarMode(layout.mode === 'auto-hide' ? 'fixed' : 'auto-hide');
}

function setSidebarMode(mode) {
  const nextMode = mode === 'auto-hide' ? 'auto-hide' : 'fixed';
  state.sidebarLayout.mode = nextMode;
  state.sidebarLayout.collapsed = nextMode === 'auto-hide';
  saveSidebarLayout();
  if (nextMode === 'auto-hide') {
    closeSidebarPeek();
    elements.sidebarCollapse.blur();
    elements.sidebarLock.blur();
    elements.sidebarSettings.blur();
  }
}

function handleSidebarDoubleClick(event) {
  if (event.target.closest('input, textarea, select, label, .sidebar-resize-handle')) {
    return;
  }
  event.preventDefault();
  toggleSidebarMode();
}

function clearSidebarAutoHideTimer() {
  if (sidebarAutoHideTimer) {
    window.clearTimeout(sidebarAutoHideTimer);
    sidebarAutoHideTimer = null;
  }
}

function openSidebarPeek() {
  const layout = normalizeSidebarLayout(state.sidebarLayout);
  if (layout.mode !== 'auto-hide') {
    return;
  }
  clearSidebarAutoHideTimer();
  document.body.classList.add('sidebar-peeking');
}

function closeSidebarPeek() {
  clearSidebarAutoHideTimer();
  document.body.classList.remove('sidebar-peeking');
}

function scheduleSidebarAutoHide() {
  const layout = normalizeSidebarLayout(state.sidebarLayout);
  if (layout.mode !== 'auto-hide') {
    return;
  }
  clearSidebarAutoHideTimer();
  sidebarAutoHideTimer = window.setTimeout(closeSidebarPeek, 1000);
}

function startSidebarResize(event) {
  const layout = normalizeSidebarLayout(state.sidebarLayout);
  if (layout.locked || layout.mode === 'auto-hide') {
    return;
  }
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = state.sidebarLayout.width;
  document.body.classList.add('sidebar-resizing');
  elements.sidebarResizeHandle.setPointerCapture?.(event.pointerId);

  const resize = (moveEvent) => {
    const nextWidth = clampSidebarWidth(startWidth + moveEvent.clientX - startX);
    state.sidebarLayout.width = nextWidth;
    document.documentElement.style.setProperty('--sidebar-width', `${nextWidth}px`);
  };

  const stop = () => {
    document.body.classList.remove('sidebar-resizing');
    window.removeEventListener('pointermove', resize);
    window.removeEventListener('pointerup', stop);
    saveSidebarLayout();
  };

  window.addEventListener('pointermove', resize);
  window.addEventListener('pointerup', stop, { once: true });
}

function clampSidebarWidth(value) {
  const width = Number.parseInt(value, 10);
  if (!Number.isFinite(width)) {
    return 208;
  }
  return Math.max(166, Math.min(340, width));
}

function renderInputModeMatrix() {
  if (!elements.inputModeMatrix) {
    return;
  }

  elements.inputModeMatrix.innerHTML = inputModeRows.map(([moduleName, scope, modes]) => `
    <article class="input-mode-row">
      <div>
        <strong>${escapeHtml(moduleName)}</strong>
        <p>${escapeHtml(scope)}</p>
      </div>
      <div class="input-mode-tags">
        ${modes.map((mode) => `<span>${escapeHtml(mode)}</span>`).join('')}
      </div>
    </article>
  `).join('');
}

function enhanceVoiceInputControls(root = document) {
  root.querySelectorAll('input, textarea').forEach((field) => {
    if (!isVoiceEligibleField(field) || field.dataset.voiceEnhanced === 'true') {
      return;
    }
    if (!field.id) {
      field.id = `voice-field-${Math.random().toString(36).slice(2, 10)}`;
    }
    const wrapper = document.createElement('span');
    wrapper.className = 'input-assist-wrap';
    field.parentNode.insertBefore(wrapper, field);
    wrapper.appendChild(field);

    const tools = document.createElement('span');
    tools.className = 'input-assist-tools';

    const voiceButton = document.createElement('button');
    voiceButton.type = 'button';
    voiceButton.className = 'field-voice-button input-assist-button';
    voiceButton.dataset.voiceTargetId = field.id;
    voiceButton.title = '语音输入';
    voiceButton.setAttribute('aria-label', '语音输入');
    voiceButton.innerHTML = microphoneIconSvg();

    const suggestionButton = document.createElement('button');
    suggestionButton.type = 'button';
    suggestionButton.className = 'field-suggestion-button input-assist-button';
    suggestionButton.dataset.suggestionTargetId = field.id;
    suggestionButton.title = '推荐选项';
    suggestionButton.setAttribute('aria-label', '推荐选项');
    suggestionButton.textContent = '⌄';

    tools.append(voiceButton, suggestionButton);
    wrapper.appendChild(tools);
    field.dataset.voiceEnhanced = 'true';
  });
}

function microphoneIconSvg() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"></path>
      <path d="M5 11v1a7 7 0 0 0 14 0v-1"></path>
      <path d="M12 19v3"></path>
      <path d="M8 22h8"></path>
    </svg>
  `;
}

function isVoiceEligibleField(field) {
  if (!field || field.disabled || field.readOnly) {
    return false;
  }
  if (field.tagName === 'TEXTAREA') {
    return true;
  }
  if (field.tagName !== 'INPUT') {
    return false;
  }
  const type = String(field.getAttribute('type') || 'text').toLowerCase();
  return ['text', 'search', 'email', 'url', 'tel'].includes(type);
}

function handleInlineVoiceClick(event) {
  const voiceButton = event.target.closest('[data-voice-target-id]');
  if (voiceButton) {
    const field = document.getElementById(voiceButton.dataset.voiceTargetId);
    if (!field || !isVoiceEligibleField(field)) {
      setVoiceSummary('这个输入框暂不支持语音输入');
      return;
    }
    closeSuggestionMenu();
    startInlineVoiceInput(field, voiceButton);
    return;
  }

  const suggestionButton = event.target.closest('[data-suggestion-target-id]');
  if (suggestionButton) {
    const field = document.getElementById(suggestionButton.dataset.suggestionTargetId);
    if (field) {
      renderSuggestionMenu(field, suggestionButton);
    }
    return;
  }

  const suggestionOption = event.target.closest('[data-suggestion-value]');
  if (suggestionOption) {
    const field = document.getElementById(suggestionOption.dataset.suggestionFieldId);
    if (field) {
      applySuggestionToField(field, suggestionOption.dataset.suggestionValue);
    }
    closeSuggestionMenu();
    return;
  }

  const addButton = event.target.closest('[data-add-custom-suggestion]');
  if (addButton) {
    const field = document.getElementById(addButton.dataset.addCustomSuggestion);
    const input = state.activeSuggestionMenu?.querySelector('[data-custom-suggestion-input]');
    if (field && input) {
      addCustomSuggestion(field, input.value);
    }
    return;
  }

  if (!event.target.closest('.input-suggestion-menu')) {
    closeSuggestionMenu();
  }
}

function renderSuggestionMenu(field, button) {
  if (state.activeSuggestionMenu?.dataset.fieldId === field.id) {
    closeSuggestionMenu();
    return;
  }
  closeSuggestionMenu();

  const wrapper = button.closest('.input-assist-wrap');
  const menu = document.createElement('div');
  menu.className = 'input-suggestion-menu';
  menu.dataset.fieldId = field.id;

  const title = document.createElement('strong');
  title.textContent = '推荐选项';
  menu.appendChild(title);

  const list = document.createElement('div');
  list.className = 'input-suggestion-list';
  const suggestions = getInputSuggestions(field);
  suggestions.forEach((value) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.dataset.suggestionFieldId = field.id;
    option.dataset.suggestionValue = value;
    option.textContent = value;
    list.appendChild(option);
  });
  if (!suggestions.length) {
    const empty = document.createElement('span');
    empty.className = 'input-suggestion-empty';
    empty.textContent = '暂无推荐，可以添加自定义常用项。';
    list.appendChild(empty);
  }
  menu.appendChild(list);

  const customRow = document.createElement('div');
  customRow.className = 'input-suggestion-custom';
  const customInput = document.createElement('input');
  customInput.type = 'text';
  customInput.maxLength = 120;
  customInput.placeholder = '自定义常用项';
  customInput.dataset.customSuggestionInput = 'true';
  const customButton = document.createElement('button');
  customButton.type = 'button';
  customButton.dataset.addCustomSuggestion = field.id;
  customButton.textContent = '加入常用';
  customRow.append(customInput, customButton);
  menu.appendChild(customRow);

  wrapper.appendChild(menu);
  state.activeSuggestionMenu = menu;
  customInput.focus();
}

function getInputSuggestions(field) {
  const key = suggestionKeyForField(field);
  const defaults = defaultSuggestionsForField(field);
  const customs = state.inputAssistCustoms[key] || [];
  return [...new Set([...customs, ...defaults])].slice(0, 12);
}

function suggestionKeyForField(field) {
  return field.id || field.name || 'common';
}

function defaultSuggestionsForField(field) {
  const id = String(field.id || '').toLowerCase();
  const placeholder = String(field.getAttribute('placeholder') || '').toLowerCase();
  if (id.includes('platform')) {
    return ['企业微信', '抖音', '小红书', '快手', '视频号', '淘宝', '拼多多', '京东'];
  }
  if (id.includes('customer') || id.includes('sender')) {
    return ['张先生', '王女士', '李总', '客户A', '待确认客户'];
  }
  if (id.includes('goal') || id.includes('target')) {
    return ['加企微', '进群', '留资', '预约咨询', '下定金', '领取资料'];
  }
  if (id.includes('comment') || id.includes('message') || id.includes('text') || placeholder.includes('客户')) {
    return ['想了解价格', '有没有案例', '怎么预约', '能发资料吗', '我想对比一下', '售后怎么保障'];
  }
  if (id.includes('region') || id.includes('city') || id.includes('province')) {
    return ['广东', '深圳', '广州', '杭州', '上海', '北京'];
  }
  if (id.includes('tag') || id.includes('category')) {
    return ['售前', '售后', '高意向', '价格敏感', '案例咨询', '复购跟进'];
  }
  if (id.includes('url') || id.includes('site') || placeholder.includes('https')) {
    return ['官网链接待补', '企业微信名片链接待补', '群邀请链接待补'];
  }
  return ['需要案例', '需要报价', '需要资料', '先了解一下', '稍后跟进', '转人工确认'];
}

function addCustomSuggestion(field, value) {
  const normalized = normalizeCustomSuggestion(value);
  if (!normalized) {
    setVoiceSummary('请先输入自定义常用项');
    return;
  }
  const key = suggestionKeyForField(field);
  const current = state.inputAssistCustoms[key] || [];
  state.inputAssistCustoms[key] = [normalized, ...current.filter((item) => item !== normalized)].slice(0, 20);
  saveInputAssistCustoms(window.localStorage, state.inputAssistCustoms);
  applySuggestionToField(field, normalized);
  closeSuggestionMenu();
  setVoiceSummary('已加入常用并写入当前输入框');
}

function normalizeCustomSuggestion(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

function applySuggestionToField(field, value) {
  const text = normalizeCustomSuggestion(value);
  if (!text) {
    return;
  }
  if (field.tagName === 'TEXTAREA') {
    field.value = field.value ? `${field.value}\n${text}` : text;
  } else {
    field.value = text;
  }
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  setVoiceSummary('已选定推荐项');
}

function closeSuggestionMenu() {
  if (state.activeSuggestionMenu) {
    state.activeSuggestionMenu.remove();
    state.activeSuggestionMenu = null;
  }
}

function startInlineVoiceInput(field, button) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setVoiceSummary('当前浏览器不支持语音识别，可先手动粘贴转写文字。');
    return;
  }

  stopVoiceInput();
  const recognition = new Recognition();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = true;
  state.voiceTargetField = field;
  state.voiceActiveButton = button;
  recognition.onstart = () => {
    button.classList.add('listening');
    setVoiceSummary('正在听写，完成后会写入当前输入框');
  };
  recognition.onerror = () => setVoiceSummary('语音识别中断，请检查浏览器麦克风权限。');
  recognition.onend = () => {
    if (state.voiceRecognition === recognition) {
      state.voiceRecognition = null;
      state.voiceTargetField = null;
      button.classList.remove('listening');
      setVoiceSummary('语音输入已停止');
    }
  };
  recognition.onresult = (event) => {
    const text = [...event.results]
      .map((result) => result[0]?.transcript || '')
      .join('')
      .trim();
    if (text) {
      writeVoiceTextToField(field, text);
    }
  };
  state.voiceRecognition = recognition;
  recognition.start();
}

function stopVoiceInput() {
  if (state.voiceRecognition) {
    state.voiceRecognition.stop();
    state.voiceRecognition = null;
  }
  if (state.voiceActiveButton) {
    state.voiceActiveButton.classList.remove('listening');
  }
  state.voiceTargetField = null;
  state.voiceActiveButton = null;
  setVoiceSummary('语音输入已停止');
}

function writeVoiceTextToField(field, text) {
  const separator = field.tagName === 'TEXTAREA' && field.value.trim() ? '\n' : '';
  field.value = field.value ? `${field.value}${separator}${text}` : text;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  setVoiceSummary('语音已写入当前输入框');
}

function setVoiceSummary(message) {
  if (elements.voiceGlobalStatus) {
    elements.voiceGlobalStatus.textContent = `语音输入：${message}`;
  }
}

function loadInputAssistCustoms(storage) {
  if (!storage) {
    return {};
  }
  try {
    const parsed = JSON.parse(storage.getItem(inputAssistStorageKey) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsed).map(([key, values]) => [
        key,
        Array.isArray(values) ? values.map(normalizeCustomSuggestion).filter(Boolean).slice(0, 20) : []
      ])
    );
  } catch {
    return {};
  }
}

function saveInputAssistCustoms(storage, customs) {
  if (!storage) {
    return;
  }
  storage.setItem(inputAssistStorageKey, JSON.stringify(customs || {}));
}

function renderTargetProfile() {
  writeTargetProfileForm(state.targetProfile);
  renderTargetProfilePreview(state.targetProfile);
}

function loadTargetProfile(storage) {
  if (!storage) {
    return defaultTargetProfile();
  }
  try {
    return normalizeTargetProfile(JSON.parse(storage.getItem(targetProfileStorageKey) || '{}'));
  } catch {
    return defaultTargetProfile();
  }
}

function saveTargetProfile(event) {
  event.preventDefault();
  state.targetProfile = readTargetProfileForm();
  window.localStorage?.setItem(targetProfileStorageKey, JSON.stringify(state.targetProfile));
  renderTargetProfilePreview(state.targetProfile);
}

function previewTargetProfileFromForm() {
  renderTargetProfilePreview(readTargetProfileForm());
}

function resetTargetProfile() {
  state.targetProfile = defaultTargetProfile();
  window.localStorage?.removeItem(targetProfileStorageKey);
  renderTargetProfile();
}

function defaultTargetProfile() {
  return {
    brand: '',
    product: '',
    sellingPoint: '',
    market: '',
    consumerSegment: '',
    conversionGoal: '',
    age: '',
    gender: '',
    needOwner: '',
    region: '',
    city: '',
    competitor: '',
    behavior: '',
    pain: '',
    media: '',
    contentPreference: ''
  };
}

function normalizeTargetProfile(input = {}) {
  const defaults = defaultTargetProfile();
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [key, normalizeProfileText(input[key], key)])
  );
}

function normalizeProfileText(value, key) {
  const max = ['behavior', 'pain', 'media', 'contentPreference'].includes(key) ? 1000 : 240;
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function targetProfileFields() {
  return [
    ['brand', '品牌/项目'],
    ['product', '产品/服务'],
    ['sellingPoint', '核心卖点'],
    ['market', '市场/行业'],
    ['consumerSegment', '消费层级'],
    ['conversionGoal', '成交目标'],
    ['age', '年龄段'],
    ['gender', '性别倾向'],
    ['needOwner', '需求角色'],
    ['region', '重点区域'],
    ['city', '重点城市'],
    ['competitor', '对标对手'],
    ['behavior', '消费行为'],
    ['pain', '痛点顾虑'],
    ['media', '媒体偏好'],
    ['contentPreference', '内容偏好']
  ];
}

function readTargetProfileForm() {
  return normalizeTargetProfile({
    brand: elements.targetBrand.value,
    product: elements.targetProduct.value,
    sellingPoint: elements.targetSellingPoint.value,
    market: elements.targetMarket.value,
    consumerSegment: elements.targetConsumerSegment.value,
    conversionGoal: elements.targetConversionGoal.value,
    age: elements.targetAge.value,
    gender: elements.targetGender.value,
    needOwner: elements.targetNeedOwner.value,
    region: elements.targetRegion.value,
    city: elements.targetCity.value,
    competitor: elements.targetCompetitor.value,
    behavior: elements.targetBehavior.value,
    pain: elements.targetPain.value,
    media: elements.targetMedia.value,
    contentPreference: elements.targetContentPreference.value
  });
}

function writeTargetProfileForm(profile = {}) {
  const normalized = normalizeTargetProfile(profile);
  setInputValue(elements.targetBrand, normalized.brand);
  setInputValue(elements.targetProduct, normalized.product);
  setInputValue(elements.targetSellingPoint, normalized.sellingPoint);
  setInputValue(elements.targetMarket, normalized.market);
  setInputValue(elements.targetConsumerSegment, normalized.consumerSegment);
  setInputValue(elements.targetConversionGoal, normalized.conversionGoal);
  setInputValue(elements.targetAge, normalized.age);
  setInputValue(elements.targetGender, normalized.gender);
  setInputValue(elements.targetNeedOwner, normalized.needOwner);
  setInputValue(elements.targetRegion, normalized.region);
  setInputValue(elements.targetCity, normalized.city);
  setInputValue(elements.targetCompetitor, normalized.competitor);
  setInputValue(elements.targetBehavior, normalized.behavior);
  setInputValue(elements.targetPain, normalized.pain);
  setInputValue(elements.targetMedia, normalized.media);
  setInputValue(elements.targetContentPreference, normalized.contentPreference);
}

function renderTargetProfilePreview(profile = {}) {
  const normalized = normalizeTargetProfile(profile);
  const fields = targetProfileFields();
  const filled = fields.filter(([key]) => normalized[key]).length;
  elements.targetProfileSummary.textContent = `${filled}/${fields.length} 已填写 · ${formatProgressPercent((filled / fields.length) * 100)}`;
  const rows = fields.map(([key, label]) => `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd class="${normalized[key] ? '' : 'warn'}">${escapeHtml(normalized[key] || '待填写')}</dd>
    </div>
  `).join('');
  elements.targetProfilePreview.innerHTML = `
    <dl>${rows}</dl>
    <div class="target-profile-brief">
      <strong>AI使用口径</strong>
      <p>${escapeHtml(buildTargetProfilePrompt(normalized))}</p>
    </div>
  `;
}

function buildTargetProfilePrompt(profile = {}) {
  const parts = [
    profile.brand || profile.product ? `围绕${profile.brand || '该品牌'}的${profile.product || '产品/服务'}` : '',
    profile.market ? `行业市场为${profile.market}` : '',
    profile.consumerSegment ? `消费层级偏${profile.consumerSegment}` : '',
    profile.age || profile.gender ? `核心人群是${[profile.age, profile.gender].filter(Boolean).join('、')}` : '',
    profile.region || profile.city ? `重点区域为${[profile.region, profile.city].filter(Boolean).join('、')}` : '',
    profile.competitor ? `对标${profile.competitor}` : '',
    profile.behavior ? `消费行为：${profile.behavior}` : '',
    profile.pain ? `主要顾虑：${profile.pain}` : '',
    profile.media ? `优先媒体：${profile.media}` : '',
    profile.contentPreference ? `内容偏好：${profile.contentPreference}` : '',
    profile.conversionGoal ? `最终引导到${profile.conversionGoal}` : ''
  ].filter(Boolean);
  return parts.length ? parts.join('；') : '先填写目标画像，后续内容、私信、客服和成交话术会按这里的画像调用。';
}

function setInputValue(element, value) {
  if (element) {
    element.value = value || '';
  }
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

function renderReadinessHub() {
  const items = getReadinessItems();
  const loaded = items.filter((item) => item.readiness);
  if (!loaded.length) {
    elements.readinessHubSummary.textContent = '待加载';
    elements.readinessHub.innerHTML = '<div class="empty">正在检查企业微信、抖音和个人微信接入条件。</div>';
    return;
  }

  const readyCount = loaded.filter((item) => item.readiness.ready).length;
  const missingCount = loaded.reduce((sum, item) => sum + (item.readiness.missingRequired?.length || 0), 0);
  const average = loaded.reduce((sum, item) => sum + Number(item.readiness.percent || 0), 0) / loaded.length;
  elements.readinessHubSummary.textContent =
    `${readyCount}/${loaded.length} 可联调 · ${formatProgressPercent(average)} · ${missingCount ? `缺 ${missingCount} 项资料` : '资料齐全'}`;

  elements.readinessHub.innerHTML = `
    <div class="readiness-hub-grid">
      ${items.map(renderReadinessPlatformCard).join('')}
    </div>
  `;
}

function getReadinessItems() {
  return [
    {
      id: 'wecom',
      name: '企业微信',
      shortName: '企微',
      focus: '群内 @ 智能客服、客户群承接、企业身份可信',
      readiness: state.wecomReadiness
    },
    {
      id: 'douyin',
      name: '抖音私信/客服',
      shortName: '抖音',
      focus: '评论私信承接、一次性开场、平台内客服对话',
      readiness: state.douyinReadiness
    },
    {
      id: 'wechat-personal',
      name: '个人微信/EasyClaw',
      shortName: '个微',
      focus: '人工确认后承接、私域关系维护、低风险跟进',
      readiness: state.wechatPersonalReadiness
    }
  ];
}

function renderReadinessPlatformCard(item) {
  const readiness = item.readiness;
  if (!readiness) {
    return `
      <article class="readiness-platform-card queued">
        <div class="readiness-platform-head">
          <span>${escapeHtml(item.shortName)}</span>
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.focus)}</p>
          </div>
          <strong>加载中</strong>
        </div>
        <div class="empty">正在读取接入检查。</div>
      </article>
    `;
  }

  const missing = readiness.missingRequired || [];
  return `
    <article class="readiness-platform-card ${readiness.ready ? 'ready' : 'blocked'}">
      <div class="readiness-platform-head">
        <span>${escapeHtml(item.shortName)}</span>
        <div>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.focus)}</p>
        </div>
        <strong>${escapeHtml(readiness.percentText)}</strong>
      </div>
      <div class="roadmap-meter" aria-label="${escapeHtml(item.name)}接入完成度${escapeHtml(readiness.percentText)}">
        <span style="width: ${Math.max(0, Math.min(100, Number(readiness.percent || 0)))}%"></span>
      </div>
      <div class="readiness-brief">
        <span class="tag status ${readiness.ready ? 'connected' : 'needs-credentials'}">${readiness.ready ? '可以联调' : '等待资料'}</span>
        <span>${missing.length ? `缺 ${escapeHtml(missing.join('、'))}` : '必填项已具备'}</span>
      </div>
      <p>${escapeHtml(readiness.launch?.title || '等待接入检查')}</p>
      <div class="readiness-action-line">下一步：${escapeHtml(readiness.launch?.nextSteps?.[0] || readiness.launch?.nextCommand || '等待接入条件')}</div>
      <details class="readiness-detail">
        <summary>查看检查明细</summary>
        <div class="readiness-detail-grid">
          ${(readiness.checks || []).map(renderReadinessCheck).join('')}
        </div>
        <div class="readiness-plan compact">
          <section>
            <h3>下一步动作</h3>
            <ol>${(readiness.launch?.nextSteps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
          </section>
          <section>
            <h3>测试验证</h3>
            <p>${escapeHtml(readiness.groupTest?.testGroup || '待配置测试群')}</p>
            <pre>${escapeHtml(readiness.groupTest?.triggerText || '待配置触发文本')}</pre>
          </section>
          <section>
            <h3>安全边界</h3>
            <ul>${(readiness.safety || []).map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul>
          </section>
        </div>
      </details>
    </article>
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
      ${renderMissingMaterials(section.missingMaterials)}
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
            <small>${escapeHtml(field.help)}${field.sensitive ? ' · 保存后不显示明文' : ''}</small>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCallCrmBlueprint() {
  const blueprint = state.callCrmBlueprint;
  const modules = new Map((blueprint?.modules || []).map((module) => [module.id, module]));
  const targets = [
    {
      id: 'ai-call',
      summary: elements.aiCallSummary,
      container: elements.aiCallBlueprint,
      fallback: '外呼 / 呼入 / 摘要 / 人工接管'
    },
    {
      id: 'yunke-call-import',
      summary: elements.yunkeCallImportSummary,
      container: elements.yunkeCallImportBlueprint,
      fallback: '通话记录 / 意向分级 / 跟进人'
    },
    {
      id: 'crm-import',
      summary: elements.crmImportSummary,
      container: elements.crmImportBlueprint,
      fallback: '字段映射 / 去重 / 同步策略'
    }
  ];

  targets.forEach((target) => {
    if (!target.summary || !target.container) {
      return;
    }
    const module = modules.get(target.id);
    if (!module) {
      target.summary.textContent = state.callCrmBlueprintError ? '蓝图接口待恢复' : target.fallback;
      target.container.innerHTML = '<div class="empty">正在读取呼叫与CRM承接蓝图。</div>';
      return;
    }

    target.summary.textContent = `${callCrmStatusLabel(module.status)} · ${module.percentText} · ${module.remainingHours.toFixed(1)} 小时`;
    target.container.innerHTML = renderCallCrmModule(module, blueprint);
  });
}

function renderResilienceBackupBlueprint() {
  const blueprint = state.resilienceBackupBlueprint;
  if (!elements.resilienceBackupSummary || !elements.resilienceBackupBlueprint) {
    return;
  }
  if (!blueprint) {
    elements.resilienceBackupSummary.textContent = state.resilienceBackupBlueprintError ? '容灾接口待恢复' : '加载中';
    elements.resilienceBackupBlueprint.innerHTML = '<div class="empty">正在读取容灾备份策略。</div>';
    return;
  }

  elements.resilienceBackupSummary.textContent =
    `${blueprint.summary?.permissionLevel || '最高权限'} · 三人审批 · ${blueprint.summary?.latestBackupName || '暂无备份'}`;
  elements.resilienceBackupBlueprint.innerHTML = `
    <div class="resilience-backup-grid">
      <article class="resilience-backup-card authority">
        <div class="channel-port-head">
          <div>
            <h3>${escapeHtml(blueprint.approvalPolicy?.level || '最高权限')}</h3>
            <p>${escapeHtml(blueprint.approvalPolicy?.rule || '高风险容灾动作必须人工审批。')}</p>
          </div>
          <span class="tag status blocked">三人同意</span>
        </div>
        <div class="roadmap-facts">
          <span>至少 ${Number(blueprint.approvalPolicy?.requiredApprovals || 3)} 名最高审批人</span>
          <span>${blueprint.approvalPolicy?.unanimousRequired ? '必须同时同意' : '按策略审批'}</span>
          <span>不自动恢复</span>
        </div>
        <div class="approval-person-list">
          ${(blueprint.approvalPolicy?.approvers || []).map((approver) => `
            <span><b>${escapeHtml(approver.role)}</b><em>${escapeHtml(approver.level)}权限</em></span>
          `).join('')}
        </div>
      </article>
      ${(blueprint.backupTypes || []).map((type) => `
        <article class="resilience-backup-card">
          <div class="channel-port-head">
            <h3>${escapeHtml(type.name)}</h3>
            <span class="tag status blocked">${escapeHtml(type.permissionLevel)}</span>
          </div>
          <p>${escapeHtml(type.scope)}</p>
          <div class="meta-line">风险：${escapeHtml(type.risk)} · 恢复：${escapeHtml(type.restoreMode)}</div>
        </article>
      `).join('')}
    </div>
    <div class="resilience-action-grid">
      ${(blueprint.actions || []).map((action) => `
        <article class="resilience-action-card ${action.sideEffectsEnabled ? 'manual' : 'dry'}">
          <div class="channel-port-head">
            <h3>${escapeHtml(action.name)}</h3>
            <span class="tag status ${action.sideEffectsEnabled ? 'needs-credentials' : 'blocked'}">${action.sideEffectsEnabled ? '需审批执行' : '只读预览'}</span>
          </div>
          <p>${escapeHtml(action.description)}</p>
          <div class="roadmap-facts">
            <span>${escapeHtml(action.permissionLevel)}</span>
            <span>${Number(action.requiredApprovals || 3)} 人审批</span>
            <span>${escapeHtml(action.mode)}</span>
          </div>
        </article>
      `).join('')}
    </div>
    ${renderResilienceBlockers(blueprint.blockers)}
    ${moduleList('恢复检查清单', blueprint.restoreChecklist || [])}
    ${moduleList('审计规则', blueprint.auditRules || [])}
  `;
}

function renderResilienceBlockers(blockers = []) {
  if (!blockers.length) {
    return '<div class="credential-checklist ready">容灾链路当前无阻塞，真实恢复和克隆仍需三名最高审批人同意。</div>';
  }
  return `
    <div class="credential-checklist">
      <strong>当前阻塞</strong>
      ${blockers.map((blocker) => `
        <span>
          <b>${escapeHtml(blocker.title)}</b>
          <em>${escapeHtml(blocker.nextStep)}</em>
        </span>
      `).join('')}
    </div>
  `;
}

function renderAgentAccessBlueprint() {
  const blueprint = state.agentAccessBlueprint;
  if (!elements.agentAccessSummary || !elements.agentAccessBlueprint) {
    return;
  }
  if (!blueprint) {
    elements.agentAccessSummary.textContent = state.agentAccessBlueprintError ? 'Agent接口待恢复' : '加载中';
    elements.agentAccessBlueprint.innerHTML = '<div class="empty">正在读取 Agent 接入策略。</div>';
    return;
  }

  elements.agentAccessSummary.textContent =
    `${blueprint.summary?.readyAgents || 0}/${blueprint.summary?.totalAgents || 0} 可沙盒联调 · 不自动执行`;
  elements.agentAccessBlueprint.innerHTML = `
    <div class="agent-access-grid">
      ${(blueprint.agents || []).map(renderAgentAccessCard).join('')}
    </div>
    <div class="agent-safety-panel">
      ${moduleList('Agent安全规则', blueprint.safetyRules || [])}
      ${moduleList('审计字段', blueprint.auditFields || [])}
    </div>
  `;
}

function renderAgentAccessCard(agent) {
  const missing = agent.missingMaterials || [];
  return `
    <article class="agent-access-card ${agent.status === 'ready_for_sandbox' ? 'ready' : 'blocked'}">
      <div class="channel-port-head">
        <div>
          <h3>${escapeHtml(agent.name)}</h3>
          <p>${escapeHtml(agent.priority)} · ${escapeHtml(agent.mode || 'dry_run_preview')}</p>
        </div>
        <span class="tag status ${agent.status === 'ready_for_sandbox' ? 'connected' : 'needs-credentials'}">${escapeHtml(agent.statusLabel || '等待资料')}</span>
      </div>
      <p>${escapeHtml(agent.role)}</p>
      <div class="roadmap-meter" aria-label="${escapeHtml(agent.name)}接入完成度${escapeHtml(agent.percentText)}">
        <span style="width: ${Math.max(0, Math.min(100, Number(agent.percent || 0)))}%"></span>
      </div>
      <div class="roadmap-facts">
        <span>完成度 ${escapeHtml(agent.percentText || '0.0%')}</span>
        <span>凭证 ${Number(agent.configuredRequired || 0)}/${Number(agent.requiredCount || 0)}</span>
        <span>不自动执行</span>
      </div>
      <div class="meta-line">下一步：${escapeHtml(agent.nextStep)}</div>
      ${renderMissingMaterials(missing)}
      <div class="tags">${(agent.capabilities || []).map((capability) => `<span class="tag">${escapeHtml(capability)}</span>`).join('')}</div>
      ${renderSandboxValidation(agent.sandboxValidation)}
      <div class="call-blueprint-actions">
        <button type="button" class="secondary" data-menu-jump="api-platform-config" data-workflow-target="api-center">去配置Agent凭证</button>
      </div>
    </article>
  `;
}

function renderCallCrmModule(module, blueprint = {}) {
  const missing = module.missingCredentials || [];
  return `
    <article class="call-blueprint-card ${callCrmStatusClass(module.status)}">
      <div class="call-blueprint-head">
        <div>
          <h3>${escapeHtml(module.statusTitle || module.title)}</h3>
          <p>${escapeHtml(blueprint.sideEffectPolicy || '当前为安全演示模式。')}</p>
        </div>
        <span class="tag status ${callCrmStatusClass(module.status)}">${escapeHtml(callCrmStatusLabel(module.status))}</span>
      </div>
      <div class="roadmap-meter" aria-label="${escapeHtml(module.title)}完成度${escapeHtml(module.percentText)}">
        <span style="width: ${Math.max(0, Math.min(100, Number(module.percent || 0)))}%"></span>
      </div>
      <div class="roadmap-facts">
        <span>完成度 ${escapeHtml(module.percentText)}</span>
        <span>倒计时 ${escapeHtml(module.remainingHours.toFixed(1))} 小时</span>
        <span>凭证 ${module.configuredCredentialCount}/${module.requiredCredentialCount}</span>
        <span>${module.actionMode === 'read_only_blueprint' ? '只读蓝图' : '沙盒人工确认'}</span>
      </div>
      <div class="meta-line">下一步：${escapeHtml(module.nextStep)}</div>
      <div class="meta-line">当前阻塞：${missing.length ? `缺 ${escapeHtml(missing.join('、'))}` : '暂无，进入沙盒联调前仍需人工确认'}</div>
      ${renderCredentialBlockers(module.credentialBlockers)}
      <div class="module-columns">
        ${moduleList('流程', module.workflows)}
        ${moduleList('输入字段', module.inputFields)}
        ${moduleList('输出字段', module.outputFields)}
        ${moduleList('安全规则', module.safetyRules)}
      </div>
      ${renderImportTemplate(module.importTemplate)}
      ${renderFieldMappingPreview(module.fieldMappings)}
      ${renderOperationPreview(module.preview)}
      <div class="call-blueprint-actions">
        <button type="button" class="secondary" data-menu-jump="api-platform-config" data-workflow-target="api-center">
          去配置凭证
        </button>
      </div>
    </article>
  `;
}

function renderMissingMaterials(materials = []) {
  if (!materials.length) {
    return '<div class="credential-checklist ready">资料已齐，可以进入下一步联调。</div>';
  }

  return `
    <div class="credential-checklist">
      <strong>还需要提供</strong>
      ${materials.map((item) => `
        <span>
          <b>${escapeHtml(item.label)}</b>
          <em>${escapeHtml(item.help)}${item.sensitive ? '；页面不会回显明文' : ''}</em>
        </span>
      `).join('')}
    </div>
  `;
}

function renderCredentialBlockers(blockers = []) {
  if (!blockers.length) {
    return '<div class="credential-checklist ready">凭证项已配置，真实动作仍需人工确认。</div>';
  }

  return `
    <div class="credential-checklist">
      <strong>凭证缺口</strong>
      ${blockers.map((item) => `
        <span>
          <b>${escapeHtml(item.label)}</b>
          <em>${escapeHtml(item.help)}${item.sensitive ? '；保存后不显示明文' : ''}</em>
        </span>
      `).join('')}
    </div>
  `;
}

function renderImportTemplate(template = {}) {
  const fields = Array.isArray(template.fields) ? template.fields : [];
  if (!template.name || !fields.length) {
    return '';
  }

  return `
    <div class="import-template-preview">
      <div class="import-template-head">
        <div>
          <h4>${escapeHtml(template.name)}</h4>
          <p>${escapeHtml(template.format || 'CSV / Excel / API JSON')}</p>
        </div>
        <span>${fields.filter((field) => field.required).length}/${fields.length} 必填</span>
      </div>
      <div class="import-template-grid">
        ${fields.map((field) => `
          <span>
            <b>${escapeHtml(field.name)}</b>
            <em>${field.required ? '必填' : '选填'} · 示例：${escapeHtml(field.example || '-')}</em>
            <small>${escapeHtml(field.note || '')}</small>
          </span>
        `).join('')}
      </div>
      ${(template.safetyNotes || []).length ? `<div class="import-template-notes">${template.safetyNotes.map((note) => `<span>${escapeHtml(note)}</span>`).join('')}</div>` : ''}
    </div>
  `;
}

function renderOperationPreview(preview = {}) {
  const rows = Array.isArray(preview.rows) ? preview.rows : [];
  if (!preview.title || !rows.length) {
    return '';
  }

  return `
    <div class="operation-preview">
      <div class="operation-preview-head">
        <div>
          <h4>${escapeHtml(preview.title)}</h4>
          <p>${escapeHtml(preview.description || '当前只做安全预览。')}</p>
        </div>
        <span class="tag status blocked">${preview.sideEffectsEnabled ? '沙盒待确认' : '只读预览'}</span>
      </div>
      <div class="operation-preview-facts">
        ${(preview.summary || []).map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
      </div>
      ${renderPreviewControls(preview)}
      ${renderSandboxValidation(preview.sandboxValidation)}
      <div class="operation-preview-list" aria-label="预览明细">
        ${rows.map((row) => `
          <article class="operation-preview-row">
            <div class="operation-preview-row-head">
              <strong>${escapeHtml(row.customerName || row.recordId || '预览记录')}</strong>
              <span>${escapeHtml(row.status || '待确认')}</span>
            </div>
            <div class="operation-preview-details">
              ${operationPreviewDetail('脱敏号码', row.maskedPhone)}
              ${operationPreviewDetail('来源平台', row.sourcePlatform)}
              ${operationPreviewDetail('意向/阶段', row.intentLevel || row.stage)}
              ${operationPreviewDetail('负责人', row.owner)}
              ${operationPreviewDetail('结果/标签', row.callResult || row.tags)}
              ${operationPreviewDetail('动作', row.action)}
              ${operationPreviewDetail('下一步', row.nextStep)}
            </div>
          </article>
        `).join('')}
      </div>
      <div class="operation-preview-review">
        <strong>人工复核：</strong>
        ${(preview.reviewChecklist || []).map((item) => `<span>${escapeHtml(item)}</span>`).join('')}
      </div>
      ${renderReviewQueue(preview.reviewQueue)}
    </div>
  `;
}

function renderSandboxValidation(validation = {}) {
  const checks = Array.isArray(validation.checks) ? validation.checks : [];
  if (!validation.title || !checks.length) {
    return '';
  }

  return `
    <div class="sandbox-validation-panel">
      <div class="sandbox-validation-head">
        <div>
          <h5>沙盒校验结果</h5>
          <p>${escapeHtml(validation.title)} · ${escapeHtml(validation.auditId || 'dry-run')}</p>
        </div>
        <span class="tag status blocked">${validation.sideEffectsEnabled ? '沙盒待确认' : '只读校验'}</span>
      </div>
      <div class="meta-line">${escapeHtml(validation.summary || '仅生成校验结果，不执行外部动作。')}</div>
      <div class="sandbox-validation-grid">
        ${checks.map((check) => `
          <article class="sandbox-validation-check ${escapeHtml(check.status || 'warning')}">
            <strong>${escapeHtml(check.name)}</strong>
            <span>${escapeHtml(validationStatusLabel(check.status))}</span>
            <p>${escapeHtml(check.result)}</p>
          </article>
        `).join('')}
      </div>
      ${renderSandboxBlockers(validation.blockers)}
    </div>
  `;
}

function renderSandboxBlockers(blockers = []) {
  if (!blockers.length) {
    return '';
  }
  return `
    <div class="sandbox-blocker-list">
      <strong>阻断原因</strong>
      ${blockers.map((blocker) => `
        <span>
          <b>${escapeHtml(blocker.reason)}</b>
          <em>${escapeHtml(blocker.nextStep)}</em>
        </span>
      `).join('')}
    </div>
  `;
}

function validationStatusLabel(status) {
  const labels = {
    passed: '通过',
    warning: '待确认',
    blocked: '阻断'
  };
  return labels[status] || status || '待确认';
}

function renderPreviewControls(preview = {}) {
  const groups = [
    {
      title: '授权校验',
      items: preview.authorizationChecks || [],
      value: (item) => `${item.status || '待检查'} · ${item.rule || ''}`
    },
    {
      title: '频控规则',
      items: preview.frequencyRules || [],
      value: (item) => `${item.limit || ''} · ${item.enforcement === 'preview_block' ? '预览阻断' : '人工确认'}`
    },
    {
      title: '异常筛选',
      items: preview.exceptionFilters || [],
      value: (item) => `${Number(item.count || 0)} 条 · ${item.action || '人工复核'}`
    }
  ].filter((group) => group.items.length);

  if (!groups.length) {
    return '';
  }

  return `
    <div class="preview-control-grid">
      ${groups.map((group) => `
        <section class="preview-control-card">
          <h5>${escapeHtml(group.title)}</h5>
          <div class="preview-control-list">
            ${group.items.map((item) => `
              <span>
                <b>${escapeHtml(item.label || item.title || item.id)}</b>
                <em>${escapeHtml(group.value(item))}</em>
              </span>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;
}

function renderReviewQueue(queue = []) {
  if (!queue.length) {
    return '';
  }

  return `
    <div class="review-queue-list">
      <div class="review-queue-head">
        <h5>人工复核清单</h5>
        <span>${queue.length} 条</span>
      </div>
      ${queue.map((item) => `
        <article class="review-queue-item ${escapeHtml(item.severity || 'medium')}">
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.reason)}</p>
          </div>
          <div class="review-queue-meta">
            <span>${escapeHtml(item.action)}</span>
            <span>${escapeHtml(item.owner || '待分配')}</span>
            <span>${escapeHtml(item.status || '待复核')}</span>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function operationPreviewDetail(label, value) {
  if (!value) {
    return '';
  }
  return `
    <span class="operation-preview-detail">
      <em>${escapeHtml(label)}</em>
      <b>${escapeHtml(value)}</b>
    </span>
  `;
}

function renderFieldMappingPreview(mappings = []) {
  if (!mappings.length) {
    return '';
  }
  return `
    <div class="field-mapping-preview">
      <div class="field-mapping-head">
        <h4>字段映射预览</h4>
        <span>${mappings.filter((item) => item.required).length}/${mappings.length} 必填</span>
      </div>
      <div class="field-mapping-table" role="table" aria-label="字段映射预览">
        <div class="field-mapping-row head" role="row">
          <span role="columnheader">来源字段</span>
          <span role="columnheader">目标字段</span>
          <span role="columnheader">规则</span>
          <span role="columnheader">要求</span>
        </div>
        ${mappings.map((item) => `
          <div class="field-mapping-row" role="row">
            <span role="cell">${escapeHtml(item.source)}</span>
            <span role="cell"><code>${escapeHtml(item.target)}</code></span>
            <span role="cell">${escapeHtml(item.rule)}</span>
            <span role="cell"><em class="${item.required ? 'warn' : 'ok'}">${item.required ? '必填' : '选填'}</em></span>
          </div>
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
    state.wecomReadiness = await api('/api/wecom/readiness');
    state.douyinReadiness = await api('/api/douyin/readiness');
    state.wechatPersonalReadiness = await api('/api/wechat-personal/readiness');
    state.projectProgress = await api('/api/project-progress');
    renderStatus(status);
    renderPlatformConfig();
    renderIntegrationRoadmap();
    renderReadinessHub();
    renderChannelPorts(status.channelPorts);
    renderWorkflowMenu();
    renderWorkflowOverview();
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
        contactCardType: elements.privateContactCardType.value,
        contactCardTitle: elements.privateContactCardTitle.value,
        contactCardDescription: elements.privateContactCardDescription.value,
        contactCardUrl: elements.privateContactCardUrl.value,
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

function callCrmStatusLabel(status) {
  const labels = {
    demo_only: '安全演示',
    ready_for_sandbox: '沙盒就绪'
  };
  return labels[status] || status || '待配置';
}

function callCrmStatusClass(status) {
  if (status === 'ready_for_sandbox') {
    return 'ready';
  }
  return 'blocked';
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
    ['场景开场', result.sceneOpening],
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
    ['针对留言回答', result.questionAnswer],
    ['解决方案', result.solutionLine],
    ['保障说明', result.guaranteeLine],
    ['价值钩子', result.valueHook],
    ['利益点', result.benefitLine],
    ['资料/权益', result.offerLine],
    ['名片卡片', result.contactCard],
    ['名片引导', result.cardCta],
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
