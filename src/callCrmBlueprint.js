const integrationDefinitions = [
  {
    id: 'ai-call',
    title: 'AI呼叫模块',
    statusTitle: '安全演示模式',
    credentialFields: [
      { key: 'CALL_PROVIDER', label: '呼叫平台名称', help: '例如阿里云、腾讯云、自有呼叫中心或第三方坐席系统。', sensitive: false },
      { key: 'CALL_API_BASE_URL', label: '呼叫平台 API 地址', help: '呼叫平台提供的测试接口基础地址。', sensitive: false },
      { key: 'CALL_API_KEY', label: '呼叫平台 API Key', help: '呼叫平台提供的测试密钥，只在本机保存，不在页面回显。', sensitive: true }
    ],
    percent: 44,
    remainingHours: 10,
    nextStep: '在平台凭证配置中心补呼叫平台凭证，并完善授权校验和人工接管规则',
    workflows: [
      '根据线索阶段、来源平台、意向等级和跟进时间生成外呼任务',
      '呼入时拉取客户画像、最近互动和知识库建议',
      '通话结束后生成摘要、需求点、异议点、意向等级和下一步动作',
      '投诉、敏感信息、明确拒绝或高风险咨询自动转人工'
    ],
    inputFields: ['客户编号', '客户称呼', '手机号脱敏值', '来源平台', '意向等级', '授权来源', '跟进时间', '负责人'],
    outputFields: ['通话状态', '通话摘要', '意向变化', '下一步动作', '人工接管原因', '审计编号'],
    importTemplate: {
      name: 'AI呼叫任务导入模板',
      format: 'CSV / Excel / API JSON',
      fields: [
        { name: '客户编号', required: true, example: 'lead-001', note: '用于关联客户档案和最近互动。' },
        { name: '客户称呼', required: true, example: '王女士', note: '外呼开场称呼，避免敏感标签。' },
        { name: '手机号脱敏值', required: true, example: '138****2468', note: '前端只展示脱敏号码。' },
        { name: '来源平台', required: true, example: '抖音评论', note: '记录线索来自哪个平台。' },
        { name: '意向等级', required: true, example: '高意向', note: '决定是否进入优先外呼队列。' },
        { name: '授权来源', required: true, example: '评论区主动咨询', note: '没有授权来源不进入真实外呼。' },
        { name: '跟进时间', required: false, example: '2026-06-28 15:30', note: '用于排程和频控。' },
        { name: '负责人', required: false, example: '销售一组', note: '用于人工接管。' }
      ],
      safetyNotes: ['模板只用于沙盒预览', '手机号必须脱敏展示', '真实外呼必须人工确认授权来源']
    },
    fieldMappings: [
      { source: '客户编号', target: 'callTask.customerId', rule: '用于关联客户档案和最近互动', required: true },
      { source: '客户称呼', target: 'callTask.customerName', rule: '外呼开场称呼，禁止拼接敏感标签', required: true },
      { source: '手机号脱敏值', target: 'callTask.maskedPhone', rule: '前端只显示脱敏号码，真实号码仅在授权服务端使用', required: true },
      { source: '来源平台', target: 'callTask.sourcePlatform', rule: '抖音、企业微信、小红书等来源统一归档', required: true },
      { source: '意向等级', target: 'callTask.intentLevel', rule: '高意向优先进入人工确认外呼队列', required: true },
      { source: '授权来源', target: 'callTask.consentSource', rule: '没有授权来源不生成真实拨号任务', required: true },
      { source: '跟进时间', target: 'callTask.scheduledAt', rule: '用于排程和频控，避免高频打扰', required: false },
      { source: '负责人', target: 'callTask.owner', rule: '用于人工接管和后续复盘', required: false }
    ],
    safetyRules: [
      '没有明确授权来源时不生成真实拨号任务',
      '演示模式只返回任务结构，不触发真实外呼',
      '手机号、微信号和病患信息默认脱敏展示',
      '医疗、金融、法律等高风险咨询必须人工确认'
    ],
    preview: {
      title: '外呼任务预览',
      description: '把高意向线索整理成待确认外呼任务，当前只做结构预览。',
      summary: ['2 条待确认任务', '0 条已执行任务', '1 条需要人工复核'],
      rows: [
        {
          customerName: '王女士',
          maskedPhone: '138****2468',
          sourcePlatform: '抖音评论',
          intentLevel: '高意向',
          consentSource: '评论区主动咨询，仍需人工确认授权',
          scheduledAt: '今天 15:30',
          owner: '销售一组',
          status: '待人工确认',
          action: '生成外呼任务草稿',
          nextStep: '确认授权来源后进入呼叫平台沙盒队列'
        },
        {
          customerName: '李先生',
          maskedPhone: '186****7731',
          sourcePlatform: '企业微信群',
          intentLevel: '中意向',
          consentSource: '群内主动留资，需确认可联系时间',
          scheduledAt: '明天 10:00',
          owner: '客服二组',
          status: '需复核',
          action: '暂存跟进提醒',
          nextStep: '补充需求标签和通话目标'
        }
      ],
      authorizationChecks: [
        { id: 'consent-source', label: '授权来源', status: '需人工确认', rule: '没有明确授权来源时禁止进入外呼队列' },
        { id: 'contact-window', label: '可联系时段', status: '待补充', rule: '只允许在客户允许或合理时段内联系' },
        { id: 'sensitive-topic', label: '敏感咨询', status: '转人工', rule: '医疗、金融、法律等高风险问题不由 AI 独立处理' }
      ],
      frequencyRules: [
        { id: 'daily-call-cap', label: '单客户日频控', limit: '每天最多 1 次外呼任务', enforcement: 'preview_block' },
        { id: 'quiet-hours', label: '静默时段', limit: '21:00-09:00 不生成外呼任务', enforcement: 'preview_block' },
        { id: 'rejection-cooldown', label: '拒绝冷却', limit: '明确拒绝后 30 天不再外呼', enforcement: 'preview_block' }
      ],
      exceptionFilters: [
        { id: 'missing-consent', label: '缺授权来源', count: 1, action: '进入人工复核' },
        { id: 'quiet-hours', label: '静默时段冲突', count: 0, action: '自动阻断任务预览' },
        { id: 'sensitive-topic', label: '敏感咨询', count: 1, action: '转人工处理' }
      ],
      reviewQueue: [
        { id: 'call-review-001', title: '王女士外呼授权确认', severity: 'high', reason: '评论区主动咨询但仍需确认可电话联系', action: '人工确认授权来源和联系时段', owner: '销售一组', status: '待复核' },
        { id: 'call-review-002', title: '李先生需求标签补充', severity: 'medium', reason: '中意向线索缺少明确通话目标', action: '补充需求标签后再生成沙盒任务', owner: '客服二组', status: '待补充' }
      ],
      sandboxValidation: {
        title: 'AI呼叫沙盒任务队列校验',
        auditId: 'dry-run-call-20260628-001',
        mode: 'dry_run',
        sideEffectsEnabled: false,
        summary: '2 条任务进入预览队列，1 条因授权待确认被阻断。',
        checks: [
          { name: '凭证检查', status: 'blocked', result: '缺呼叫平台凭证，仅生成预览队列' },
          { name: '授权来源检查', status: 'warning', result: '1 条任务需人工确认授权来源' },
          { name: '频控检查', status: 'passed', result: '未超过日频控、静默时段和拒绝冷却限制' },
          { name: '敏感问题检查', status: 'warning', result: '敏感咨询进入人工接管清单' }
        ],
        blockers: [
          { reason: '缺呼叫平台凭证', nextStep: '补呼叫平台名称、接口地址和测试密钥后进入沙盒任务队列' },
          { reason: '授权来源待确认', nextStep: '人工确认客户同意被电话联系后再放行' }
        ]
      },
      reviewChecklist: ['人工确认授权来源', '人工确认联系时间', '敏感问题转人工', '仅进入沙盒队列']
    }
  },
  {
    id: 'yunke-call-import',
    title: '人工呼叫导入云客',
    statusTitle: '导入模板模式',
    credentialFields: [
      { key: 'YUNKE_API_BASE_URL', label: '云客 API 地址', help: '云客系统提供的测试接口基础地址。', sensitive: false },
      { key: 'YUNKE_API_TOKEN', label: '云客 API Token', help: '云客系统提供的测试访问令牌，只在本机保存。', sensitive: true }
    ],
    percent: 47,
    remainingHours: 7,
    nextStep: '在平台凭证配置中心补云客凭证，并完善字段映射、去重和授权来源校验',
    workflows: [
      '导入人工呼叫记录、通话结果、客户意向和跟进人',
      '导入前检查重复客户、手机号格式、授权来源和异常字段',
      '按高意向、中意向、低意向、投诉/负面进入不同承接池',
      '真实写入云客前生成预览和人工确认记录'
    ],
    inputFields: ['客户称呼', '手机号脱敏值', '来源平台', '通话时间', '通话结果', '意向等级', '跟进人', '下次跟进时间', '备注'],
    outputFields: ['导入批次号', '新增数量', '更新数量', '重复数量', '异常数量', '复核清单'],
    importTemplate: {
      name: '人工呼叫导入云客模板',
      format: 'CSV / Excel / API JSON',
      fields: [
        { name: '客户称呼', required: true, example: '陈女士', note: '进入云客客户名称字段。' },
        { name: '手机号脱敏值', required: true, example: '139****5820', note: '前端只展示脱敏号码。' },
        { name: '来源平台', required: true, example: '小红书私信', note: '用于渠道归因。' },
        { name: '通话时间', required: true, example: '2026-06-28 14:00', note: '用于跟进排序。' },
        { name: '通话结果', required: true, example: '已接通', note: '成功、未接、拒接、需复拨等标准值。' },
        { name: '意向等级', required: true, example: '高意向', note: '决定承接池。' },
        { name: '跟进人', required: false, example: '顾问A', note: '缺失时进入待分配池。' },
        { name: '下次跟进时间', required: false, example: '2026-06-29 10:00', note: '形成二次跟进提醒。' },
        { name: '备注', required: false, example: '需要案例资料', note: '敏感内容不外显。' }
      ],
      safetyNotes: ['导入前必须去重', '手机号必须脱敏展示', '异常数据进入人工复核']
    },
    fieldMappings: [
      { source: '客户称呼', target: 'yunkeCustomer.name', rule: '进入云客客户名称字段，空值进入异常清单', required: true },
      { source: '手机号脱敏值', target: 'yunkeCustomer.maskedPhone', rule: '导入预览只展示脱敏值，真实写入前二次确认', required: true },
      { source: '来源平台', target: 'yunkeLead.source', rule: '记录抖音、快手、小红书、企微等来源', required: true },
      { source: '通话时间', target: 'yunkeCall.calledAt', rule: '用于排序、批次复核和跟进节奏', required: true },
      { source: '通话结果', target: 'yunkeCall.result', rule: '成功、未接、拒接、空号、需复拨等标准值', required: true },
      { source: '意向等级', target: 'yunkeLead.intentLevel', rule: '高意向、中意向、低意向、负面/投诉分池', required: true },
      { source: '跟进人', target: 'yunkeLead.owner', rule: '用于任务归属和后续追踪', required: false },
      { source: '下次跟进时间', target: 'yunkeLead.nextFollowAt', rule: '形成二次跟进提醒', required: false },
      { source: '备注', target: 'yunkeCall.note', rule: '保留人工补充信息，敏感内容不外显', required: false }
    ],
    safetyRules: [
      '没有云客凭证时只做模板预览',
      '导入前必须执行去重和脱敏预览',
      '异常数据进入人工复核，不自动覆盖客户资料',
      '所有导入批次保留审计记录'
    ],
    preview: {
      title: '云客导入批次预览',
      description: '把人工通话记录整理成云客导入批次，先展示新增、更新、重复和异常。',
      summary: ['新增 1 条', '更新 1 条', '重复 1 条', '异常 1 条'],
      rows: [
        {
          customerName: '陈女士',
          maskedPhone: '139****5820',
          sourcePlatform: '小红书私信',
          callResult: '已接通',
          intentLevel: '高意向',
          owner: '顾问A',
          status: '可导入',
          action: '新增客户记录',
          nextStep: '进入高意向承接池'
        },
        {
          customerName: '周先生',
          maskedPhone: '177****6912',
          sourcePlatform: '快手评论',
          callResult: '未接通',
          intentLevel: '中意向',
          owner: '顾问B',
          status: '待更新',
          action: '更新最近跟进记录',
          nextStep: '设置二次跟进提醒'
        },
        {
          customerName: '赵女士',
          maskedPhone: '135****8088',
          sourcePlatform: '抖音客服',
          callResult: '号码重复',
          intentLevel: '普通意向',
          owner: '待分配',
          status: '需人工复核',
          action: '进入重复清单',
          nextStep: '人工确认是否合并客户'
        }
      ],
      exceptionFilters: [
        { id: 'duplicate-phone', label: '号码重复', count: 1, action: '进入重复客户复核' },
        { id: 'missing-owner', label: '缺跟进人', count: 1, action: '进入待分配池' },
        { id: 'invalid-call-result', label: '通话结果异常', count: 0, action: '阻断导入预览' },
        { id: 'missing-consent', label: '缺授权来源', count: 0, action: '导入前人工确认' }
      ],
      reviewQueue: [
        { id: 'yunke-review-001', title: '赵女士重复客户确认', severity: 'high', reason: '同一脱敏号码疑似已存在客户', action: '人工确认合并或新建', owner: '待分配', status: '待复核' },
        { id: 'yunke-review-002', title: '周先生二次跟进确认', severity: 'medium', reason: '未接通但有中意向标签', action: '确认下次跟进时间和负责人', owner: '顾问B', status: '待补充' }
      ],
      sandboxValidation: {
        title: '云客沙盒导入校验',
        auditId: 'dry-run-yunke-20260628-001',
        mode: 'dry_run',
        sideEffectsEnabled: false,
        summary: '3 条记录进入导入预览，1 条重复客户被阻断，1 条待补跟进人。',
        checks: [
          { name: '凭证检查', status: 'blocked', result: '缺云客接口凭证，仅生成导入预览' },
          { name: '字段映射检查', status: 'passed', result: '客户称呼、脱敏号码、来源、通话结果均可映射' },
          { name: '重复检查', status: 'warning', result: '1 条疑似重复客户进入人工复核' },
          { name: '异常字段检查', status: 'warning', result: '1 条记录缺跟进人，进入待分配池' }
        ],
        blockers: [
          { reason: '缺云客 API 凭证', nextStep: '补云客接口地址、测试令牌和导入模板后进入沙盒导入校验' },
          { reason: '重复客户待合并', nextStep: '人工确认合并或新建后再放行' }
        ]
      },
      reviewChecklist: ['人工复核重复客户', '人工确认异常字段', '导入前再次脱敏预览', '保留批次审计记录']
    }
  },
  {
    id: 'crm-import',
    title: '导入到CRM系统',
    statusTitle: '字段映射模式',
    credentialFields: [
      { key: 'CRM_API_BASE_URL', label: 'CRM API 地址', help: 'CRM 系统提供的测试接口基础地址。', sensitive: false },
      { key: 'CRM_API_TOKEN', label: 'CRM API Token', help: 'CRM 系统提供的测试访问令牌，只在本机保存。', sensitive: true }
    ],
    percent: 45,
    remainingHours: 8,
    nextStep: '在平台凭证配置中心补 CRM 凭证，并完善字段映射、同步策略和审计记录',
    workflows: [
      '把线索、客户阶段、标签、负责人和最近互动同步到 CRM',
      '按手机号、平台ID、客户编号执行去重和合并建议',
      '同步失败时保留失败原因、重试次数和人工处理入口',
      '成交、复购、流失和售后状态回流到营销系统'
    ],
    inputFields: ['线索编号', '客户名称', '手机号脱敏值', '平台来源', '客户阶段', '标签', '跟进人', '最近互动', '成交状态'],
    outputFields: ['CRM客户编号', '同步状态', '新增/更新标记', '失败原因', '重试次数', '审计编号'],
    importTemplate: {
      name: 'CRM线索同步模板',
      format: 'CSV / Excel / API JSON',
      fields: [
        { name: '线索编号', required: true, example: 'lead-20260628-001', note: '作为幂等键之一，避免重复写入。' },
        { name: '客户名称', required: true, example: '黄女士', note: 'CRM联系人名称。' },
        { name: '手机号脱敏值', required: true, example: '150****9041', note: '前端只展示脱敏号码。' },
        { name: '平台来源', required: true, example: '企业微信', note: '用于渠道归因。' },
        { name: '客户阶段', required: true, example: '预约沟通', note: '陌生、咨询、预约、成交、复购、售后等。' },
        { name: '标签', required: false, example: '高意向,需要案例', note: '来源、意向、产品、风险和复购标签。' },
        { name: '跟进人', required: false, example: '销售一组', note: '用于任务归属。' },
        { name: '最近互动', required: false, example: '抖音私信咨询价格', note: '保留最近互动摘要。' },
        { name: '成交状态', required: false, example: '未成交', note: '成交、未成交、退款、复购等状态。' }
      ],
      safetyNotes: ['同步前必须确认字段映射', '手机号必须脱敏展示', '真实写入必须保留审计编号']
    },
    fieldMappings: [
      { source: '线索编号', target: 'crmLead.externalLeadId', rule: '作为幂等键之一，避免重复写入', required: true },
      { source: '客户名称', target: 'crmContact.name', rule: 'CRM联系人名称，空值进入人工复核', required: true },
      { source: '手机号脱敏值', target: 'crmContact.maskedPhone', rule: '前端脱敏展示，真实同步由服务端按权限处理', required: true },
      { source: '平台来源', target: 'crmLead.sourcePlatform', rule: '用于渠道 ROI 和线索归因', required: true },
      { source: '客户阶段', target: 'crmLead.stage', rule: '陌生、咨询、预约、成交、复购、售后等阶段', required: true },
      { source: '标签', target: 'crmLead.tags', rule: '来源、意向、产品、风险和复购标签', required: false },
      { source: '跟进人', target: 'crmLead.owner', rule: '同步负责人，失败时进入待分配池', required: false },
      { source: '最近互动', target: 'crmLead.lastInteraction', rule: '保留最近评论、私信、电话或群聊摘要', required: false },
      { source: '成交状态', target: 'crmDeal.status', rule: '成交、未成交、退款、复购等状态回流', required: false }
    ],
    safetyRules: [
      '没有 CRM 凭证时不写入第三方系统',
      '字段映射必须白名单化，避免错误覆盖核心客户字段',
      '失败重试有次数限制，避免重复写入',
      '敏感字段不在前端显示明文'
    ],
    preview: {
      title: 'CRM同步预览',
      description: '把线索阶段、标签、负责人和最近互动整理成 CRM 同步草稿。',
      summary: ['新增线索 1 条', '更新客户 1 条', '跳过异常 1 条'],
      rows: [
        {
          customerName: '黄女士',
          maskedPhone: '150****9041',
          sourcePlatform: '企业微信',
          stage: '预约沟通',
          tags: '高意向, 需要案例',
          owner: '销售一组',
          status: '可同步',
          action: '新增 CRM 线索',
          nextStep: '同步后生成跟进任务'
        },
        {
          customerName: '林先生',
          maskedPhone: '188****3007',
          sourcePlatform: '抖音私信',
          stage: '持续跟单',
          tags: '价格敏感, 等活动',
          owner: '客服二组',
          status: '待更新',
          action: '更新客户阶段和最近互动',
          nextStep: '写入最近一次私信摘要'
        },
        {
          customerName: '未知客户',
          maskedPhone: '166****0000',
          sourcePlatform: '短信',
          stage: '待确认',
          tags: '缺授权来源',
          owner: '待分配',
          status: '跳过并复核',
          action: '进入异常清单',
          nextStep: '人工补齐授权来源后再同步'
        }
      ],
      exceptionFilters: [
        { id: 'missing-consent', label: '缺授权来源', count: 1, action: '跳过同步并复核' },
        { id: 'missing-idempotency-key', label: '缺幂等键', count: 0, action: '阻断同步预览' },
        { id: 'owner-missing', label: '缺负责人', count: 1, action: '进入待分配池' },
        { id: 'stage-conflict', label: '阶段冲突', count: 0, action: '进入人工复核' }
      ],
      reviewQueue: [
        { id: 'crm-review-001', title: '未知客户授权来源补齐', severity: 'high', reason: '短信来源线索缺授权来源', action: '补齐授权后再同步 CRM', owner: '待分配', status: '跳过并复核' },
        { id: 'crm-review-002', title: '林先生阶段更新确认', severity: 'medium', reason: '客户阶段从私信转持续跟单，需要确认最近互动摘要', action: '人工确认阶段和备注后同步', owner: '客服二组', status: '待确认' }
      ],
      sandboxValidation: {
        title: 'CRM沙盒同步校验',
        auditId: 'dry-run-crm-20260628-001',
        mode: 'dry_run',
        sideEffectsEnabled: false,
        summary: '3 条线索进入同步预览，1 条缺授权来源被跳过，2 条待人工确认。',
        checks: [
          { name: '凭证检查', status: 'blocked', result: '缺 CRM 接口凭证，仅生成同步预览' },
          { name: '幂等键检查', status: 'passed', result: '线索编号和脱敏号码可用于去重预览' },
          { name: '授权来源检查', status: 'warning', result: '1 条短信来源线索缺授权来源' },
          { name: '阶段冲突检查', status: 'passed', result: '未发现阶段回退冲突' }
        ],
        blockers: [
          { reason: '缺 CRM API 凭证', nextStep: '补 CRM 接口地址、测试令牌和字段表后进入沙盒同步校验' },
          { reason: '授权来源缺失', nextStep: '补齐授权来源后再纳入同步预览' }
        ]
      },
      reviewChecklist: ['人工确认字段映射', '人工复核异常客户', '同步前检查幂等键', '保留 CRM 审计编号']
    }
  }
];

export function buildCallCrmBlueprint({ env = process.env, now = new Date() } = {}) {
  const modules = integrationDefinitions.map((definition) => {
    const credentialFields = definition.credentialFields || [];
    const missingCredentialFields = credentialFields.filter((field) => !String(env[field.key] || '').trim());
    const missingCredentials = missingCredentialFields.map((field) => field.label);
    const credentialBlockers = missingCredentialFields.map((field) => ({
      label: field.label,
      help: field.help,
      sensitive: field.sensitive
    }));
    const ready = missingCredentials.length === 0;

    return {
      id: definition.id,
      title: definition.title,
      status: ready ? 'ready_for_sandbox' : 'demo_only',
      statusTitle: ready ? '沙盒联调就绪' : definition.statusTitle,
      percent: ready ? Math.min(100, definition.percent + 18) : definition.percent,
      percentText: `${(ready ? Math.min(100, definition.percent + 18) : definition.percent).toFixed(1)}%`,
      remainingHours: ready ? Math.max(2, definition.remainingHours - 4) : definition.remainingHours,
      missingCredentials,
      credentialBlockers,
      configuredCredentialCount: credentialFields.length - missingCredentials.length,
      requiredCredentialCount: credentialFields.length,
      actionMode: ready ? 'sandbox_requires_manual_approval' : 'read_only_blueprint',
      nextStep: ready ? '进入沙盒联调，仍需人工确认后才允许真实写入或拨号' : definition.nextStep,
      workflows: definition.workflows,
      inputFields: definition.inputFields,
      outputFields: definition.outputFields,
      importTemplate: definition.importTemplate,
      fieldMappings: definition.fieldMappings,
      preview: {
        mode: 'preview_only',
        sideEffectsEnabled: false,
        ...definition.preview
      },
      safetyRules: definition.safetyRules
    };
  });

  return {
    name: '呼叫与CRM承接蓝图',
    updatedAt: now.toISOString(),
    safeMode: true,
    sideEffectsEnabled: false,
    sideEffectPolicy: '当前接口只返回配置蓝图和校验规则，不触发真实拨号、云客写入或 CRM 写入。',
    summary: {
      total: modules.length,
      ready: modules.filter((module) => module.status === 'ready_for_sandbox').length,
      demoOnly: modules.filter((module) => module.status === 'demo_only').length,
      averagePercent: Number((modules.reduce((sum, module) => sum + module.percent, 0) / modules.length).toFixed(1)),
      remainingHours: modules.reduce((sum, module) => sum + module.remainingHours, 0)
    },
    modules
  };
}
