const agentDefinitions = [
  {
    id: 'open-cloud-agent',
    name: 'Open cloud agent',
    priority: '优先推荐',
    role: '承接外部 Agent 的任务拆分、状态同步、工具调用预览和跨系统协作。',
    required: [
      { label: 'Open cloud agent 地址', help: '由 Open cloud agent 服务后台提供，用于接收沙盒任务。', sensitive: false },
      { label: 'Open cloud agent Token', help: '访问令牌只保存在本机配置，不在页面或接口中回显。', sensitive: true }
    ],
    optional: [
      { label: '项目编号', help: '用于区分不同项目或工作区。', sensitive: false },
      { label: '工作区编号', help: '用于将任务路由到指定工作区。', sensitive: false }
    ],
    envKeys: ['OPEN_CLOUD_AGENT_BASE_URL', 'OPEN_CLOUD_AGENT_TOKEN'],
    optionalEnvKeys: ['OPEN_CLOUD_AGENT_PROJECT_ID', 'OPEN_CLOUD_AGENT_WORKSPACE_ID'],
    capabilities: ['任务拆分', '进度同步', '阻塞回传', '沙盒工具调用', '跨线程协作'],
    nextWhenReady: '先发送沙盒 ping 和任务预览，不直接执行外部工具。'
  },
  {
    id: 'hermes-agent',
    name: 'Hermes agent',
    priority: '优先推荐',
    role: '作为用户和 Codex 的双向信使：收指令、发进度、回传阻塞和审批提醒。',
    required: [
      { label: 'Hermes agent Webhook', help: 'Hermes 接收指令或进度的 Webhook 地址。', sensitive: false },
      { label: 'Hermes agent Token', help: 'Hermes 访问令牌只保存在本机配置。', sensitive: true }
    ],
    optional: [{ label: 'Hermes 频道名称', help: '用于区分项目、群组或飞书频道。', sensitive: false }],
    envKeys: ['HERMES_AGENT_WEBHOOK_URL', 'HERMES_AGENT_TOKEN'],
    optionalEnvKeys: ['HERMES_AGENT_CHANNEL'],
    capabilities: ['双向指令', '4小时进度回传', '阻塞提醒', '审批提醒', '甘特图通知'],
    nextWhenReady: '接入 Hermes 后仍进入收件箱，人工接受后再执行。'
  },
  {
    id: 'custom-agent',
    name: '自定义Agent',
    priority: '可扩展',
    role: '允许接入销售复盘、知识库、质检、投放、客服训练等自定义 Agent。',
    required: [
      { label: '自定义Agent名称', help: '用于在后台识别这个 Agent 的用途。', sensitive: false },
      { label: '自定义Agent地址', help: '自定义 Agent 的 API 或 Webhook 地址。', sensitive: false },
      { label: '自定义Agent Token', help: '访问令牌只保存在本机配置。', sensitive: true }
    ],
    optional: [
      { label: '允许能力范围', help: '例如只读、写入草稿、发送审批、查询知识库。', sensitive: false },
      { label: '回调地址', help: '用于接收 Agent 处理结果。', sensitive: false }
    ],
    envKeys: ['CUSTOM_AGENT_NAME', 'CUSTOM_AGENT_BASE_URL', 'CUSTOM_AGENT_TOKEN'],
    optionalEnvKeys: ['CUSTOM_AGENT_CAPABILITIES', 'CUSTOM_AGENT_WEBHOOK_URL'],
    capabilities: ['自定义任务', '只读查询', '草稿生成', '审批队列', '审计日志'],
    nextWhenReady: '先登记能力白名单，默认只读预览，禁止自动执行真实外部动作。'
  }
];

export function buildAgentAccessBlueprint({ env = process.env, now = new Date() } = {}) {
  const agents = agentDefinitions.map((definition) => buildAgent(definition, env));
  const readyAgents = agents.filter((agent) => agent.status === 'ready_for_sandbox').length;

  return {
    name: 'Agent接入中心',
    generatedAt: now.toISOString(),
    safeMode: true,
    sideEffectsEnabled: false,
    mode: 'dry_run_preview',
    summary: {
      totalAgents: agents.length,
      readyAgents,
      missingRequired: agents.reduce((sum, agent) => sum + agent.missingMaterials.length, 0),
      status: readyAgents ? 'sandbox_ready' : 'needs_credentials',
      nextStep: readyAgents
        ? '已具备沙盒联调条件，仍需人工确认后才允许执行任何外部动作。'
        : '先补 Open cloud agent 或 Hermes agent 的地址和令牌，再做沙盒联调。'
    },
    agents,
    approvalPolicy: {
      defaultMode: '收件箱人工接受后执行',
      highRiskMode: '涉及外部写入、发送、恢复、克隆、删除时必须升级审批',
      requiredApprovals: 1,
      highRiskRequiredApprovals: 3,
      note: 'Agent 只能提交草稿、预览和审批请求，不允许自行绕过人工确认。'
    },
    safetyRules: [
      '所有 Agent 默认进入 dry_run_preview 沙盒预览模式。',
      '不自动执行外部发送、拨号、删除、恢复、克隆或真实写入。',
      '密钥只允许保存在本机环境配置，API 和页面不返回明文。',
      '外部 Agent 的每次任务必须写入审计日志，并可追踪来源、目标、审批人和结果。',
      '任何高风险动作必须人工确认；容灾恢复、克隆机和生产写入必须三名最高审批人同意。'
    ],
    auditFields: ['任务来源', 'Agent名称', '动作类型', '沙盒结果', '审批状态', '审批人', '执行结果', '回滚方案']
  };
}

function buildAgent(definition, env) {
  const requiredItems = definition.required.map((item, index) => ({
    ...item,
    configured: hasValue(env[definition.envKeys[index]])
  }));
  const optionalItems = definition.optional.map((item, index) => ({
    ...item,
    configured: hasValue(env[definition.optionalEnvKeys[index]])
  }));
  const missingMaterials = requiredItems.filter((item) => !item.configured).map(stripConfigured);
  const configuredRequired = requiredItems.length - missingMaterials.length;
  const status = missingMaterials.length
    ? definition.id === 'custom-agent'
      ? 'optional'
      : 'needs_credentials'
    : 'ready_for_sandbox';

  return {
    id: definition.id,
    name: configuredCustomName(definition, env),
    priority: definition.priority,
    role: definition.role,
    mode: 'dry_run_preview',
    status,
    statusLabel: agentStatusLabel(status),
    requiredCount: requiredItems.length,
    configuredRequired,
    percent: Number(((configuredRequired / requiredItems.length) * 100).toFixed(1)),
    percentText: `${((configuredRequired / requiredItems.length) * 100).toFixed(1)}%`,
    missingMaterials,
    requiredMaterials: requiredItems.map(stripConfigured),
    optionalMaterials: optionalItems.map(stripConfigured),
    capabilities: definition.capabilities,
    nextStep: missingMaterials.length
      ? `补齐 ${missingMaterials.slice(0, 2).map((item) => item.label).join('、')}`
      : definition.nextWhenReady,
    sandboxValidation: {
      title: `${definition.name} 沙盒接入校验`,
      sideEffectsEnabled: false,
      checks: [
        {
          name: '凭证检查',
          status: missingMaterials.length ? 'blocked' : 'passed',
          result: missingMaterials.length ? `缺 ${missingMaterials.map((item) => item.label).join('、')}` : '必填接入资料已配置'
        },
        {
          name: '权限检查',
          status: 'warning',
          result: '当前只允许收件箱、草稿、预览和审批请求'
        },
        {
          name: '审计检查',
          status: 'passed',
          result: '所有入站和出站任务都必须保留审计字段'
        }
      ]
    }
  };
}

function configuredCustomName(definition, env) {
  if (definition.id !== 'custom-agent') {
    return definition.name;
  }
  const name = String(env.CUSTOM_AGENT_NAME || '').trim();
  return name || definition.name;
}

function stripConfigured(item) {
  return {
    label: item.label,
    help: item.help,
    sensitive: Boolean(item.sensitive)
  };
}

function agentStatusLabel(status) {
  if (status === 'ready_for_sandbox') {
    return '可沙盒联调';
  }
  if (status === 'optional') {
    return '可选接入';
  }
  return '等待资料';
}

function hasValue(value) {
  return Boolean(String(value || '').trim());
}
