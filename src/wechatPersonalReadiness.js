const requiredItems = [
  {
    key: 'EASYCLAW_BASE_URL',
    label: 'EasyClaw 地址',
    source: '本机 EasyClaw 服务地址，例如 http://127.0.0.1:10027'
  },
  {
    key: 'EASYCLAW_ACCESS_TOKEN',
    label: 'EasyClaw Token',
    source: 'EasyClaw 本地信使访问令牌'
  },
  {
    key: 'OPENAI_API_KEY',
    fallbackKey: 'CCX_ACCESS_KEY',
    label: '知识库接口密钥',
    source: 'OpenAI/CCX 兼容接口'
  }
];

export function buildWechatPersonalReadiness({ env = process.env, host = '127.0.0.1', port = 8787 } = {}) {
  const checks = [
    ...requiredItems.map((item) => buildCredentialCheck(item, env, true)),
    {
      id: 'human-handoff',
      label: '人工确认边界',
      status: 'ready',
      required: true,
      sensitive: false,
      detail: '个人微信端口默认只做辅助回复和人工确认，不做强自动化群发',
      nextStep: '真实接入时继续保持先生成建议、人工确认、再发送'
    },
    {
      id: 'easyclaw-runtime',
      label: 'EasyClaw 本地服务',
      status: 'manual',
      required: false,
      sensitive: false,
      detail: '需要确认 EasyClaw 正在本机运行，并且微信会话能力已登录可用',
      nextStep: '填写地址和 Token 后，用测试账号发送一条消息验证中转'
    },
    {
      id: 'admin-console',
      label: '后台控制台',
      status: 'ready',
      required: true,
      sensitive: false,
      detail: `本机后台地址 http://${host}:${port}`,
      nextStep: '在平台凭证配置中心补齐个人微信必填项'
    }
  ];

  const missingRequired = checks.filter((check) => check.required && check.status !== 'ready').map((check) => check.id);
  const readyRequired = checks.filter((check) => check.required && check.status === 'ready').length;
  const requiredCount = checks.filter((check) => check.required).length;
  const percent = requiredCount ? Math.round((readyRequired / requiredCount) * 1000) / 10 : 100;
  const ready = missingRequired.length === 0;

  return {
    platform: '个人微信/EasyClaw',
    status: ready ? 'ready_for_local_bridge' : 'blocked_by_credentials',
    percent,
    percentText: `${percent.toFixed(1)}%`,
    ready,
    missingRequired,
    checks,
    launch: buildLaunchPlan({ ready, missingRequired, env }),
    groupTest: buildMessageTest(env),
    safety: [
      '诊断结果只显示是否已配置，不返回 EasyClaw Token、API Key 或其他密钥明文。',
      '个人微信不适合强自动化，真实发送默认必须人工确认。',
      '建议只做客服辅助、跟进提醒和话术建议，不做陌生人批量触达。'
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

function buildLaunchPlan({ ready, missingRequired, env }) {
  const baseUrl = String(env.EASYCLAW_BASE_URL || 'http://127.0.0.1:10027').trim();
  if (!ready) {
    return {
      status: 'blocked',
      title: '暂不能接入个人微信/EasyClaw',
      nextCommand: '先补齐平台凭证配置中心里的 EasyClaw 和知识库必填项',
      nextSteps: [
        `缺少：${missingRequired.join('、')}`,
        '确认 EasyClaw 已启动，且微信账号处于可收发状态',
        '先用测试账号验证消息中转，再进入人工确认发送'
      ]
    };
  }

  return {
    status: 'ready',
    title: '可以进入个人微信/EasyClaw 本地中转联调',
    nextCommand: `检查 EasyClaw 地址：${baseUrl}`,
    nextSteps: [
      '确认 EasyClaw 服务在线，微信账号已登录',
      '用测试账号发送一条咨询消息，确认系统能生成建议回复',
      '确认建议回复先进入人工确认，不自动发给联系人'
    ]
  };
}

function buildMessageTest() {
  return {
    testGroup: '先用内部测试微信号，不直接接入正式客户会话',
    triggerText: '客户微信：我想了解一下资料和预约方式',
    expectedResult: '系统生成客服辅助建议，并提示人工确认后再发送。',
    passCriteria: ['能收到 EasyClaw 中转消息', '能生成建议回复', '能保留人工确认', '不会自动批量发送']
  };
}

function configured(value) {
  return Boolean(String(value || '').trim());
}

function isSensitiveKey(key = '') {
  return /(SECRET|TOKEN|PASSWORD|ACCESS_KEY|API_KEY|APP_KEY|BUSINESS_TOKEN)$/i.test(key);
}
