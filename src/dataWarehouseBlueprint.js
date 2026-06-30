const warehouseLayers = [
  {
    id: 'raw-events',
    name: '原始数据层',
    scope: '保留评论、私信、客服消息、导入表格、呼叫摘要和接口回调的原始摘要。',
    output: '按日期、平台、账号和来源分区，方便追溯。'
  },
  {
    id: 'clean-profile',
    name: '清洗画像层',
    scope: '把地域、性别倾向、需求角色、消费力、竞品来源和媒体偏好做标准化。',
    output: '形成可用于内容、私信、客服和成交的客户画像。'
  },
  {
    id: 'knowledge-graph',
    name: '知识图谱层',
    scope: '把知识库、FAQ、案例、资质、产品功效和处理步骤沉淀成图谱节点。',
    output: '支持 AI 客服按行业、场景和问题链路回答。'
  },
  {
    id: 'lead-conversion',
    name: '线索成交层',
    scope: '沉淀高意向、中意向、普通意向、负面风险、跟进阶段和成交结果。',
    output: '支持复盘私信、客服、引流、成交和复购效果。'
  },
  {
    id: 'audit-permission',
    name: '审计权限层',
    scope: '保存建仓批次、审批人、口令确认、共享范围、平仓原因和回滚方案。',
    output: '任何共享、平仓、清仓、恢复和外部导出都能追责。'
  }
];

export function buildDataWarehouseBlueprint({ localStatus = {}, now = new Date() } = {}) {
  const blockers = buildBlockers(localStatus);
  const status = blockers.length ? 'blocked_until_safe' : 'ready_for_nightly_build';
  const counts = localStatus.counts || {};
  const sourceCounts = [
    { id: 'knowledge', name: '知识库', count: Number(counts.knowledge || 0) },
    { id: 'conversations', name: '会话记录', count: Number(counts.conversations || 0) },
    { id: 'growth-leads', name: '私域线索', count: Number(counts.growthLeads || 0) },
    { id: 'private-approvals', name: '私信审批', count: Number(counts.privateMessageApprovals || 0) },
    { id: 'hermes-commands', name: 'Hermes 指令', count: Number(counts.hermesCommands || 0) }
  ];
  const totalRecords = sourceCounts.reduce((sum, item) => sum + item.count, 0);

  return {
    name: '数据建仓与仓库权限中心',
    generatedAt: now.toISOString(),
    safeMode: true,
    sideEffectsEnabled: false,
    summary: {
      status,
      statusLabel: status === 'ready_for_nightly_build' ? '夜间建仓可进入沙盒计划' : '建仓前需先排除阻塞',
      totalSourceRecords: totalRecords,
      latestBackupName: localStatus.latestBackup?.name || '暂无备份',
      nextStep: blockers.length
        ? blockers[0].nextStep
        : '默认每天 00:00-02:00 等任务跑完后建仓，先生成沙盒批次和审计记录。'
    },
    schedule: {
      window: '每天 00:00-02:00',
      preferredRunAt: '02:00',
      autoBuildEnabled: true,
      dependencyRule: '等待导入、备份、客服消息同步、私信审批和呼叫摘要任务跑完，再启动建仓。',
      fallbackRule: '如果 02:00 前仍有任务未完成，则顺延到任务结束后；超过 04:00 自动转人工复核。'
    },
    sourceCounts,
    warehouseLayers,
    actions: [
      {
        id: 'nightly-build',
        name: '夜间自动建仓',
        mode: 'scheduled_preview_then_build',
        window: '00:00-02:00',
        sideEffectsEnabled: false,
        description: '1.0 先生成建仓批次预览、依赖检查和审计记录，真实自动写入需要审批后开启。'
      },
      {
        id: 'manual-build',
        name: '手动补建仓',
        mode: 'manual_preview',
        sideEffectsEnabled: false,
        description: '人工触发指定日期或指定平台的建仓预览，不直接覆盖正式仓库。'
      },
      {
        id: 'warehouse-share',
        name: '仓库共享',
        mode: 'approval_preview_only',
        sideEffectsEnabled: false,
        description: '任何对外共享都必须有 Alex 同意、口令确认、共享范围和到期时间。'
      },
      {
        id: 'warehouse-closeout',
        name: '平仓/清仓/归档',
        mode: 'approval_preview_only',
        sideEffectsEnabled: false,
        description: '平仓、清仓、归档、删除和恢复都属于高风险动作，默认只给预案。'
      }
    ],
    permissionPolicy: {
      owner: 'Alex Ho',
      ownerConsentRequired: true,
      passphraseRequired: true,
      requiredApprovals: 3,
      approvalRoles: ['Alex Ho', '系统最高管理员', '数据安全最高负责人'],
      blockedWithoutOwner: ['共享', '平仓', '清仓', '删除', '恢复', '克隆', '外部导出', '跨系统同步'],
      rule: '仓库共享、平仓、清仓、删除、恢复、克隆和外部导出必须先得到 Alex 同意，再完成口令确认和三人审批。'
    },
    guardrails: [
      '建仓可以定时自动生成沙盒批次，但正式共享和高风险写入不能自动执行。',
      '仓库共享必须填写共享对象、范围、时长、用途、口令确认和审批人。',
      '平仓、清仓、删除、恢复、克隆、外部导出必须至少三名最高权限审批人同意。',
      '密钥、Token、手机号、身份证、病历、财务等敏感信息不进入可见导出包明文。',
      '每次建仓、共享、平仓都必须保留审计记录和回滚方案。'
    ],
    blockers
  };
}

function buildBlockers(localStatus) {
  const blockers = [];
  if (!localStatus.latestBackup) {
    blockers.push({
      id: 'missing-backup',
      title: '建仓前缺少备份',
      severity: 'high',
      nextStep: '先执行一次本机备份，再开启夜间建仓批次。'
    });
  }

  if (localStatus.admin && (!localStatus.admin.processAlive || !localStatus.admin.httpOk)) {
    blockers.push({
      id: 'runtime-offline',
      title: '后台未在线',
      severity: 'medium',
      nextStep: '先确认本地后台和演示地址在线，再运行建仓计划。'
    });
  }

  const missingFiles = (localStatus.files || []).filter((file) => !file.exists);
  if (missingFiles.length) {
    blockers.push({
      id: 'missing-data-files',
      title: `数据文件缺失：${missingFiles.map((file) => file.name).join('、')}`,
      severity: 'high',
      nextStep: '先恢复缺失数据文件，避免建仓批次不完整。'
    });
  }

  return blockers;
}
