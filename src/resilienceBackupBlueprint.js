const backupTypes = [
  {
    id: 'time-capsule',
    name: '时间胶囊备份',
    scope: '按时间点保留知识库、线索、私信审批、Hermes 指令和配置摘要。',
    risk: '中高',
    permissionLevel: '最高权限',
    restoreMode: '只允许先做恢复演练，再人工确认是否覆盖。'
  },
  {
    id: 'full-database',
    name: '完整数据库备份',
    scope: '完整保存业务数据、知识库、客户阶段、会话记录和导入导出材料。',
    risk: '高',
    permissionLevel: '最高权限',
    restoreMode: '恢复前必须生成安全备份，并比对数据差异。'
  },
  {
    id: 'organization-structure',
    name: '组织架构备份',
    scope: '保存部门、角色、权限、审批人、负责人和工作流归属。',
    risk: '高',
    permissionLevel: '最高权限',
    restoreMode: '只能在审批通过后写入组织架构草稿，不直接覆盖生产组织。'
  },
  {
    id: 'node-protocol-port',
    name: '节点协议端口备份',
    scope: '保存平台端口、Webhook、协议节点、Agent 接入口和 API 配置状态。',
    risk: '高',
    permissionLevel: '最高权限',
    restoreMode: '恢复前必须做端口冲突检测和凭证有效性复核。'
  },
  {
    id: 'clone-machine',
    name: '完完全全克隆机备份',
    scope: '保存可迁移运行环境、配置模板、数据快照和启动脚本。',
    risk: '最高',
    permissionLevel: '最高权限',
    restoreMode: '1.0 只生成克隆清单和演练计划，不执行真实克隆。'
  }
];

const systems = [
  ['knowledge', '知识库与知识图谱', 'knowledge'],
  ['conversation', '会话记录与问答日志', 'conversations'],
  ['growth', '私域引流与线索池', 'growthLeads'],
  ['approval', '私信审批队列', 'privateMessageApprovals'],
  ['hermes', 'Hermes 指令与阻塞回传', 'hermesCommands'],
  ['platform-port', '平台协议端口与 API 配置', 'platformPorts'],
  ['agent', 'Agent 接入与审计策略', 'agentAccess']
];

export function buildResilienceBackupBlueprint({ localStatus = {}, now = new Date() } = {}) {
  const blockers = buildBlockers(localStatus);
  const status = blockers.length ? 'needs_backup' : 'ready';

  return {
    name: '容灾备份中心',
    generatedAt: now.toISOString(),
    safeMode: true,
    sideEffectsEnabled: false,
    summary: {
      status,
      statusLabel: status === 'ready' ? '备份链路可用' : '需要补备份',
      latestBackupName: localStatus.latestBackup?.name || '暂无备份',
      protectedSystems: systems.length,
      backupTypes: backupTypes.length,
      requiredApprovals: 3,
      permissionLevel: '最高权限',
      nextStep: blockers.length ? blockers[0].nextStep : '继续保持本机备份，并补自动备份计划和恢复演练记录。'
    },
    approvalPolicy: {
      level: '最高权限',
      requiredApprovals: 3,
      unanimousRequired: true,
      approvers: [
        { role: '系统最高管理员', level: '最高' },
        { role: '业务最高负责人', level: '最高' },
        { role: '数据安全最高负责人', level: '最高' }
      ],
      rule: '时间胶囊、完整数据库、组织架构、节点协议端口、完完全全克隆机备份和恢复，至少三名最高审批人同时同意。'
    },
    backupTypes,
    systems: systems.map(([id, name, countKey]) => ({
      id,
      name,
      status: countKey === 'platformPorts' || countKey === 'agentAccess' ? 'policy_ready' : 'tracked',
      count: Number(localStatus.counts?.[countKey] || 0),
      protection: '本机快照 + 导出迁移 + 审计记录'
    })),
    actions: [
      {
        id: 'manual-backup',
        name: '立即本机备份',
        mode: 'local_snapshot',
        permissionLevel: '最高权限',
        approvalRequired: true,
        requiredApprovals: 3,
        sideEffectsEnabled: true,
        description: '复制 data 目录中的核心业务数据，生成 manifest。'
      },
      {
        id: 'restore-rehearsal',
        name: '恢复演练',
        mode: 'dry_run_preview',
        permissionLevel: '最高权限',
        approvalRequired: true,
        requiredApprovals: 3,
        sideEffectsEnabled: false,
        description: '只做恢复差异检查和步骤预览，不覆盖当前数据。'
      },
      {
        id: 'clone-machine-plan',
        name: '克隆机备份计划',
        mode: 'dry_run_preview',
        permissionLevel: '最高权限',
        approvalRequired: true,
        requiredApprovals: 3,
        sideEffectsEnabled: false,
        description: '生成克隆机清单、依赖、启动命令和迁移步骤，不执行真实克隆。'
      }
    ],
    blockers,
    retentionPolicy: '本机手动备份保留最近 30 天；时间胶囊建议按小时、每日、每周分层保存；外部异地备份需三名最高审批人同意后启用。',
    auditRules: [
      '恢复前必须先生成 before-restore 安全备份。',
      '所有备份、恢复、克隆、端口迁移都必须记录审批人、时间、范围、影响和回滚方案。',
      '密钥不进入导出包明文；只导出是否已配置和需要重新授权的清单。',
      '克隆机备份只生成演练计划，真实执行必须三名最高审批人同时同意。'
    ],
    restoreChecklist: ['确认备份名称', '生成恢复前安全备份', '比对数据差异', '三名最高审批人确认', '执行恢复', '验证系统状态', '记录审计']
  };
}

function buildBlockers(localStatus) {
  const blockers = [];
  if (!localStatus.latestBackup) {
    blockers.push({
      id: 'missing-backup',
      title: '还没有备份',
      severity: 'high',
      nextStep: '先执行一次本机备份，再补恢复演练计划。'
    });
  }

  if (localStatus.admin && (!localStatus.admin.processAlive || !localStatus.admin.httpOk)) {
    blockers.push({
      id: 'runtime-offline',
      title: '后台未在线',
      severity: 'medium',
      nextStep: '先启动后台并确认本地演示地址可访问。'
    });
  }

  const missingFiles = (localStatus.files || []).filter((file) => !file.exists);
  if (missingFiles.length) {
    blockers.push({
      id: 'missing-data-files',
      title: `数据文件缺失：${missingFiles.map((file) => file.name).join('、')}`,
      severity: 'high',
      nextStep: '先恢复缺失数据文件或重新初始化数据目录。'
    });
  }

  return blockers;
}
