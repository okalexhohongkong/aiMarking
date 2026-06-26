const requiredItems = [
  {
    key: 'DOUYIN_APP_ID',
    label: '抖音 AppID',
    source: '抖音开放平台应用'
  },
  {
    key: 'DOUYIN_APP_SECRET',
    label: '抖音 AppSecret',
    source: '抖音开放平台应用密钥'
  },
  {
    key: 'OPENAI_API_KEY',
    fallbackKey: 'CCX_ACCESS_KEY',
    label: '知识库接口密钥',
    source: 'OpenAI/CCX 兼容接口'
  }
];

export function buildDouyinReadiness({ env = process.env, host = '127.0.0.1', port = 8787 } = {}) {
  const checks = [
    ...requiredItems.map((item) => buildCredentialCheck(item, env, true)),
    {
      id: 'douyin-service-permission',
      label: '抖音客服/私信权限',
      status: 'manual',
      required: false,
      sensitive: false,
      detail: '需要在抖音企业号或开放平台后台确认账号已开通客服、私信或消息回调能力',
      nextStep: '拿到 AppID/AppSecret 后，进入抖音后台确认消息权限和回调配置'
    },
    {
      id: 'human-approval',
      label: '人工审核机制',
      status: 'ready',
      required: true,
      sensitive: false,
      detail: '当前系统已支持私信审批队列，默认不自动发送一次性私信',
      nextStep: '真实接入时继续保持先生成、再审核、再发送'
    },
    {
      id: 'admin-console',
      label: '后台控制台',
      status: 'ready',
      required: true,
      sensitive: false,
      detail: `本机后台地址 http://${host}:${port}`,
      nextStep: '在平台凭证配置中心补齐抖音必填项'
    }
  ];

  const missingRequired = checks.filter((check) => check.required && check.status !== 'ready').map((check) => check.id);
  const readyRequired = checks.filter((check) => check.required && check.status === 'ready').length;
  const requiredCount = checks.filter((check) => check.required).length;
  const percent = requiredCount ? Math.round((readyRequired / requiredCount) * 1000) / 10 : 100;
  const ready = missingRequired.length === 0;

  return {
    platform: '抖音私信/客服',
    status: ready ? 'ready_for_callback' : 'blocked_by_credentials',
    percent,
    percentText: `${percent.toFixed(1)}%`,
    ready,
    missingRequired,
    checks,
    launch: buildLaunchPlan({ ready, missingRequired }),
    groupTest: buildMessageTest(),
    safety: [
      '诊断结果只显示是否已配置，不返回 AppSecret、API Key 或 Token 明文。',
      '抖音真实私信、客服消息和评论回复必须遵守平台规则，默认进入人工审核。',
      '一次性私信只用于来源清楚、用户有互动记录的场景，不做无差别批量触达。'
    ]
  };
}

function buildCredentialCheck(item, env, required) {
  const isReady = configured(env[item.key]) || (item.fallbackKey ? configured(env[item.fallbackKey]) : false);
  return {
    id: item.key,
    label: item.label,
    status: isReady ? 'ready' : required ? 'missing' : 'optional',
    required,
    sensitive: isSensitiveKey(item.key) || isSensitiveKey(item.fallbackKey),
    detail: isReady ? '已配置' : `${item.source} 提供`,
    nextStep: isReady ? '保持现有配置' : required ? `在平台凭证配置中心填写 ${item.key}` : '没有特殊部署时可先不填'
  };
}

function buildLaunchPlan({ ready, missingRequired }) {
  if (!ready) {
    return {
      status: 'blocked',
      title: '暂不能接入真实抖音客服/私信',
      nextCommand: '先补齐平台凭证配置中心里的抖音和知识库必填项',
      nextSteps: [
        `缺少：${missingRequired.join('、')}`,
        '确认抖音账号已开通客服、私信或消息回调权限',
        '先用端口模拟器验证话术，再进入真实回调联调'
      ]
    };
  }

  return {
    status: 'ready',
    title: '可以进入抖音客服/私信回调联调',
    nextCommand: '在抖音开放平台配置消息回调，并用端口模拟器做对照验证',
    nextSteps: [
      '确认抖音后台消息事件能回调到服务端',
      '用一条测试私信验证统一客服引擎是否返回建议回复',
      '确认回复先进入人工审批队列，再逐步打开真实发送'
    ]
  };
}

function buildMessageTest() {
  return {
    testGroup: '先用抖音测试账号或沙箱回调，不直接对真实线索自动发送',
    triggerText: '客户私信：你好，想了解资料和优惠',
    expectedResult: '系统生成来源清楚、有身份说明、有资料权益、有下一步入口的建议回复，并进入人工审核。',
    passCriteria: ['能收到回调', '能生成建议回复', '能进入私信审批队列', '不会自动群发或批量私信']
  };
}

function configured(value) {
  return Boolean(String(value || '').trim());
}

function isSensitiveKey(key = '') {
  return /(SECRET|TOKEN|PASSWORD|ACCESS_KEY|API_KEY|APP_KEY|BUSINESS_TOKEN)$/i.test(key);
}
