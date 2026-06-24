const integrationDefinitions = [
  {
    id: 'wecom',
    name: '企业微信',
    priority: 1,
    channel: '企业微信智能机器人',
    requiredEnv: ['WECOM_BOT_ID', 'WECOM_BOT_SECRET'],
    basePercent: 45,
    readyPercent: 75,
    remainingHours: 6,
    nextStep: '填入 Bot ID 和 Secret 后启动长连接联调',
    risk: '缺凭证时无法真实进群验证'
  },
  {
    id: 'douyin',
    name: '抖音私信/客服',
    priority: 2,
    channel: '抖音开放平台/企业号客服',
    requiredEnv: ['DOUYIN_APP_ID', 'DOUYIN_APP_SECRET'],
    basePercent: 25,
    readyPercent: 55,
    remainingHours: 10,
    nextStep: '确认账号类型、客服权限和消息回调能力',
    risk: '不同账号类型权限差异较大'
  },
  {
    id: 'wechat-personal',
    name: '个人微信',
    priority: 3,
    channel: '本地信使中转/人工确认',
    requiredEnv: ['EASYCLAW_BASE_URL', 'EASYCLAW_ACCESS_TOKEN'],
    basePercent: 18,
    readyPercent: 45,
    remainingHours: 8,
    nextStep: '企业微信和抖音稳定后接入人工确认链路',
    risk: '个人微信不适合强自动化'
  },
  {
    id: 'xiaohongshu',
    name: '小红书客服',
    priority: 4,
    channel: '专业号/客服能力',
    requiredEnv: ['XHS_APP_ID', 'XHS_APP_SECRET'],
    basePercent: 15,
    readyPercent: 38,
    remainingHours: 8,
    nextStep: '复用内容平台客服端口模型',
    risk: '需确认官方客服接口权限'
  },
  {
    id: 'kuaishou',
    name: '快手客服',
    priority: 5,
    channel: '快手开放平台客服',
    requiredEnv: ['KUAISHOU_APP_ID', 'KUAISHOU_APP_SECRET'],
    basePercent: 15,
    readyPercent: 38,
    remainingHours: 8,
    nextStep: '复用内容平台客服端口模型',
    risk: '需确认开放平台应用权限'
  },
  {
    id: 'wechat-channels',
    name: '视频号客服',
    priority: 6,
    channel: '视频号/微信客服',
    requiredEnv: ['WECHAT_CHANNELS_APP_ID', 'WECHAT_CHANNELS_APP_SECRET'],
    basePercent: 14,
    readyPercent: 36,
    remainingHours: 8,
    nextStep: '复用微信生态客服承接策略',
    risk: '需确认视频号和微信客服权限'
  },
  {
    id: 'taobao',
    name: '淘宝客服',
    priority: 7,
    channel: '淘宝开放平台/千牛客服',
    requiredEnv: ['TAOBAO_APP_KEY', 'TAOBAO_APP_SECRET'],
    basePercent: 12,
    readyPercent: 34,
    remainingHours: 10,
    nextStep: '只做平台内承接，先整理合规边界',
    risk: '电商平台不直接站外引流'
  },
  {
    id: 'pinduoduo',
    name: '拼多多客服',
    priority: 8,
    channel: '拼多多开放平台客服',
    requiredEnv: ['PDD_CLIENT_ID', 'PDD_CLIENT_SECRET'],
    basePercent: 12,
    readyPercent: 34,
    remainingHours: 10,
    nextStep: '只做平台内承接，先整理合规边界',
    risk: '电商平台不直接站外引流'
  },
  {
    id: 'jd',
    name: '京东客服',
    priority: 9,
    channel: '京东宙斯/咚咚客服',
    requiredEnv: ['JD_APP_KEY', 'JD_APP_SECRET'],
    basePercent: 12,
    readyPercent: 34,
    remainingHours: 10,
    nextStep: '只做平台内承接，先整理合规边界',
    risk: '电商平台不直接站外引流'
  },
  {
    id: 'sms',
    name: '短信',
    priority: 10,
    channel: '短信供应商适配层',
    requiredEnv: ['SMS_PROVIDER', 'SMS_ACCESS_KEY_ID', 'SMS_ACCESS_KEY_SECRET'],
    basePercent: 10,
    readyPercent: 30,
    remainingHours: 8,
    nextStep: '确认短信供应商、用户授权、退订和频控规则',
    risk: '短信触达必须有用户授权和退订机制'
  },
  {
    id: 'toutiao',
    name: '头条号/今日头条',
    priority: 11,
    channel: '头条号/今日头条开放能力',
    requiredEnv: ['TOUTIAO_APP_ID', 'TOUTIAO_APP_SECRET'],
    basePercent: 10,
    readyPercent: 30,
    remainingHours: 8,
    nextStep: '确认头条内容账号的消息和评论线索权限',
    risk: '需确认账号类型和平台开放能力'
  },
  {
    id: 'baijiahao',
    name: '百度百家号',
    priority: 12,
    channel: '百度百家号开放能力',
    requiredEnv: ['BAIJIAHAO_APP_ID', 'BAIJIAHAO_APP_SECRET'],
    basePercent: 10,
    readyPercent: 30,
    remainingHours: 8,
    nextStep: '确认百家号消息、评论和内容线索权限',
    risk: '需确认官方开放接口和账号权限'
  },
  {
    id: 'bilibili',
    name: 'B站',
    priority: 13,
    channel: 'Bilibili 账号消息/互动能力',
    requiredEnv: ['BILIBILI_APP_KEY', 'BILIBILI_APP_SECRET'],
    basePercent: 10,
    readyPercent: 30,
    remainingHours: 8,
    nextStep: '确认 B 站私信和互动线索承接方式',
    risk: '需确认开放能力和账号授权范围'
  },
  {
    id: 'zhihu',
    name: '知乎',
    priority: 14,
    channel: '知乎机构号/消息能力',
    requiredEnv: ['ZHIHU_CLIENT_ID', 'ZHIHU_CLIENT_SECRET'],
    basePercent: 10,
    readyPercent: 30,
    remainingHours: 8,
    nextStep: '确认知乎问答、私信和机构号权限',
    risk: '需确认平台消息权限和合规边界'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    priority: 15,
    channel: 'LinkedIn Page/Messaging API',
    requiredEnv: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    basePercent: 8,
    readyPercent: 28,
    remainingHours: 10,
    nextStep: '确认公司主页、应用权限和潜客承接流程',
    risk: '跨境社交平台权限和合规要求较复杂'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    priority: 16,
    channel: 'Facebook Page Messenger API',
    requiredEnv: ['FACEBOOK_PAGE_ID', 'FACEBOOK_PAGE_ACCESS_TOKEN', 'FACEBOOK_VERIFY_TOKEN'],
    basePercent: 8,
    readyPercent: 28,
    remainingHours: 10,
    nextStep: '确认主页、Webhook 验证和 Messenger 权限',
    risk: '需遵守 Meta 平台消息和营销触达政策'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    priority: 17,
    channel: 'WhatsApp Business Platform',
    requiredEnv: ['WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_BUSINESS_TOKEN'],
    basePercent: 8,
    readyPercent: 28,
    remainingHours: 10,
    nextStep: '确认 Business 账号、号码和模板消息规则',
    risk: '需用户同意，模板消息审核影响触达'
  },
  {
    id: 'x-twitter',
    name: 'X/Twitter',
    priority: 18,
    channel: 'X API / Direct Messages',
    requiredEnv: ['X_TWITTER_API_KEY', 'X_TWITTER_API_SECRET'],
    basePercent: 8,
    readyPercent: 28,
    remainingHours: 10,
    nextStep: '确认 X API 权限、私信和公开互动边界',
    risk: '平台 API 权限和费用策略可能变化'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    priority: 19,
    channel: 'TikTok for Business/Open API',
    requiredEnv: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    basePercent: 8,
    readyPercent: 28,
    remainingHours: 10,
    nextStep: '确认 TikTok 账号类型、消息和评论线索权限',
    risk: '海外内容平台权限和地区政策差异较大'
  }
];

export function buildIntegrationRoadmap({ env = process.env, now = new Date() } = {}) {
  const credentialMap = new Map();
  const steps = integrationDefinitions.map((definition) => {
    const credentialStatus = getCredentialStatus(definition.requiredEnv, env);
    credentialMap.set(definition.id, credentialStatus);
    return buildStep(definition, credentialStatus, 'queued', now);
  });

  const wecom = steps.find((step) => step.id === 'wecom');
  const douyin = steps.find((step) => step.id === 'douyin');
  if (wecom) {
    if (credentialMap.get('wecom').complete) {
      Object.assign(wecom, buildStep(integrationDefinitions[0], credentialMap.get('wecom'), 'ready', now));
      if (douyin) {
        Object.assign(douyin, buildStep(integrationDefinitions[1], credentialMap.get('douyin'), 'active', now));
      }
    } else {
      Object.assign(wecom, buildStep(integrationDefinitions[0], credentialMap.get('wecom'), 'blocked', now));
    }
  }

  const summary = {
    total: steps.length,
    ready: steps.filter((step) => step.status === 'ready').length,
    active: steps.filter((step) => step.status === 'active').length,
    blocked: steps.filter((step) => step.status === 'blocked').length,
    queued: steps.filter((step) => step.status === 'queued').length,
    remainingHours: steps.reduce((sum, step) => sum + step.remainingHours, 0)
  };

  return {
    updatedAt: now.toISOString(),
    summary,
    steps
  };
}

function buildStep(definition, credentialStatus, status, now) {
  const percent = credentialStatus.complete ? definition.readyPercent : definition.basePercent;
  return {
    id: definition.id,
    name: definition.name,
    priority: definition.priority,
    channel: definition.channel,
    status,
    statusLabel: statusLabel(status),
    percent,
    percentText: `${percent.toFixed(1)}%`,
    remainingHours: definition.remainingHours,
    countdownText: `${definition.remainingHours.toFixed(1)} 小时`,
    requiredEnv: credentialStatus.required,
    missingRequired: credentialStatus.missing,
    nextStep: definition.nextStep,
    risk: definition.risk,
    updatedAt: now.toISOString()
  };
}

function getCredentialStatus(keys, env) {
  const required = keys.map((key) => ({
    key,
    filled: Boolean(String(env[key] || '').trim())
  }));
  return {
    required,
    missing: required.filter((item) => !item.filled).map((item) => item.key),
    complete: required.length > 0 && required.every((item) => item.filled)
  };
}

function statusLabel(status) {
  const labels = {
    blocked: '等待资料',
    active: '正在推进',
    ready: '凭证已备',
    queued: '排队中'
  };
  return labels[status] || status;
}
