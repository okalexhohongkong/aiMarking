const requiredItems = [
  {
    key: 'WECOM_BOT_ID',
    label: '企业微信机器人 ID',
    source: '企业微信管理后台智能机器人'
  },
  {
    key: 'WECOM_BOT_SECRET',
    label: '企业微信机器人 Secret',
    source: '企业微信管理后台智能机器人'
  },
  {
    key: 'OPENAI_API_KEY',
    fallbackKey: 'CCX_ACCESS_KEY',
    label: '知识库接口密钥',
    source: 'OpenAI/CCX 兼容接口'
  }
];

const optionalItems = [
  {
    key: 'WECOM_WS_URL',
    label: '企业微信长连接地址',
    source: '私有部署企业才需要填写'
  },
  {
    key: 'BOT_MENTION_NAME',
    label: '机器人被 @ 名称',
    source: '群里 @ 这个名字触发知识库回答'
  }
];

export function buildWecomReadiness({ env = process.env, host = '127.0.0.1', port = 8787 } = {}) {
  const checks = [
    ...requiredItems.map((item) => buildCredentialCheck(item, env, true)),
    ...optionalItems.map((item) => buildCredentialCheck(item, env, false)),
    {
      id: 'knowledge-base',
      label: '知识库名称',
      status: configured(env.KNOWLEDGE_BASE_NAME) ? 'ready' : 'defaulted',
      required: false,
      detail: configured(env.KNOWLEDGE_BASE_NAME) ? '已配置知识库名称' : '未填写时使用默认“奥普C在知识库”',
      nextStep: configured(env.KNOWLEDGE_BASE_NAME) ? '保持现有配置' : '如需换行业知识库，可在系统基础配置中填写'
    },
    {
      id: 'admin-console',
      label: '后台控制台',
      status: 'ready',
      required: true,
      detail: `本机后台地址 http://${host}:${port}`,
      nextStep: '在平台凭证配置中心补齐企业微信必填项'
    }
  ];

  const missingRequired = checks.filter((check) => check.required && check.status !== 'ready').map((check) => check.id);
  const readyRequired = checks.filter((check) => check.required && check.status === 'ready').length;
  const requiredCount = checks.filter((check) => check.required).length;
  const percent = requiredCount ? Math.round((readyRequired / requiredCount) * 1000) / 10 : 100;
  const ready = missingRequired.length === 0;

  return {
    platform: '企业微信',
    status: ready ? 'ready_for_launch' : 'blocked_by_credentials',
    percent,
    percentText: `${percent.toFixed(1)}%`,
    ready,
    missingRequired,
    checks,
    launch: buildLaunchPlan({ ready, missingRequired, env }),
    groupTest: buildGroupTest(env),
    safety: [
      '诊断结果只显示是否已配置，不返回机器人 Secret、API Key 或 Token 明文。',
      '真实群发前先在测试群验证，确认 @ 触发、知识库回答和转人工口径。',
      '负面评论、站外引导和营销私信仍走人工审核，不自动群发。'
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
  const mentionName = String(env.BOT_MENTION_NAME || '智能客服').trim();
  if (!ready) {
    return {
      status: 'blocked',
      title: '暂不能启动真实企业微信机器人',
      nextCommand: '先补齐平台凭证配置中心里的企业微信和知识库必填项',
      nextSteps: [
        `缺少：${missingRequired.join('、')}`,
        '补齐后重启后台或桌面 App',
        `把机器人加入测试群，在群里发送 @${mentionName} 合同怎么签？`
      ]
    };
  }

  return {
    status: 'ready',
    title: '可以进入企业微信真实联调',
    nextCommand: 'npm start',
    nextSteps: [
      '启动后观察控制台是否出现“企业微信智能机器人认证成功”',
      `把机器人加入测试群，在群里发送 @${mentionName} 合同怎么签？`,
      '确认回答来自知识库，再逐步加入正式群'
    ]
  };
}

function buildGroupTest(env) {
  const mentionName = String(env.BOT_MENTION_NAME || '智能客服').trim();
  return {
    testGroup: '先用内部测试群，不直接放进所有正式群',
    triggerText: `@${mentionName} 合同怎么签？`,
    expectedResult: '机器人只在被 @ 或名称前缀触发时回答，并调用奥普C在知识库组织答案。',
    passCriteria: ['能成功认证', '群内 @ 后 10 秒内有回复', '回答内容有结论、有步骤、有转人工口径']
  };
}

function configured(value) {
  return Boolean(String(value || '').trim());
}

function isSensitiveKey(key = '') {
  return /(SECRET|TOKEN|PASSWORD|ACCESS_KEY|API_KEY|APP_KEY|BUSINESS_TOKEN)$/i.test(key);
}
