const portDefinitions = [
  {
    id: 'wecom',
    name: '企业微信',
    group: '微信生态',
    adapter: '官方智能机器人 WebSocket',
    statusWhenMissing: 'needs_credentials',
    implemented: true,
    requiredEnv: ['WECOM_BOT_ID', 'WECOM_BOT_SECRET'],
    capabilities: ['群 @ 问答', '知识库回答', '人工确认'],
    privateTrafficPolicy: '允许企微内承接',
    notes: '1.0 主通道，填好凭证后可启动。'
  },
  {
    id: 'wechat-miniapp',
    name: '微信小程序客服',
    group: '微信生态',
    adapter: '微信小程序客服消息 API',
    implemented: false,
    requiredEnv: ['WECHAT_MINIAPP_APP_ID', 'WECHAT_MINIAPP_APP_SECRET', 'WECHAT_MINIAPP_TOKEN'],
    capabilities: ['小程序客服', '资料领取', '线索记录'],
    privateTrafficPolicy: '允许微信生态内承接',
    notes: '预留小程序客服入口，等小程序后台权限开通后接入。'
  },
  {
    id: 'wechat-personal',
    name: '个人微信',
    group: '微信生态',
    adapter: 'EasyClaw/本地信使中转',
    implemented: false,
    requiredEnv: ['EASYCLAW_BASE_URL', 'EASYCLAW_ACCESS_TOKEN'],
    capabilities: ['人工辅助回复', '私域跟进', '线索沉淀'],
    privateTrafficPolicy: '只做人工确认后的辅助承接',
    notes: '个人微信不做强自动化，优先做合规的人机协同。'
  },
  {
    id: 'douyin',
    name: '抖音客服',
    group: '内容平台',
    adapter: '抖音开放平台/企业号客服 API',
    implemented: false,
    requiredEnv: ['DOUYIN_APP_ID', 'DOUYIN_APP_SECRET'],
    capabilities: ['私信客服', '评论线索', '话术建议'],
    privateTrafficPolicy: '平台内优先，私域引导需人工确认',
    notes: '预留抖音客服和线索承接入口。'
  },
  {
    id: 'kuaishou',
    name: '快手客服',
    group: '内容平台',
    adapter: '快手开放平台客服 API',
    implemented: false,
    requiredEnv: ['KUAISHOU_APP_ID', 'KUAISHOU_APP_SECRET'],
    capabilities: ['私信客服', '评论线索', '话术建议'],
    privateTrafficPolicy: '平台内优先，私域引导需人工确认',
    notes: '预留快手客服和线索承接入口。'
  },
  {
    id: 'xiaohongshu',
    name: '小红书客服',
    group: '内容平台',
    adapter: '小红书专业号/客服 API',
    implemented: false,
    requiredEnv: ['XHS_APP_ID', 'XHS_APP_SECRET'],
    capabilities: ['私信客服', '种草咨询', '线索记录'],
    privateTrafficPolicy: '平台内优先，私域引导需人工确认',
    notes: '预留小红书私信客服入口。'
  },
  {
    id: 'wechat-channels',
    name: '视频号客服',
    group: '微信生态',
    adapter: '视频号/微信客服 API',
    implemented: false,
    requiredEnv: ['WECHAT_CHANNELS_APP_ID', 'WECHAT_CHANNELS_APP_SECRET'],
    capabilities: ['微信客服', '直播线索', '资料承接'],
    privateTrafficPolicy: '允许微信生态内承接',
    notes: '预留视频号和微信客服入口。'
  },
  {
    id: 'taobao',
    name: '淘宝客服',
    group: '电商平台',
    adapter: '淘宝开放平台/千牛客服 API',
    implemented: false,
    requiredEnv: ['TAOBAO_APP_KEY', 'TAOBAO_APP_SECRET'],
    capabilities: ['售前咨询', '订单问题', '平台内承接'],
    privateTrafficPolicy: '仅平台内承接，不直接站外引流',
    notes: '电商平台默认开启站外引导合规拦截。'
  },
  {
    id: 'pinduoduo',
    name: '拼多多客服',
    group: '电商平台',
    adapter: '拼多多开放平台客服 API',
    implemented: false,
    requiredEnv: ['PDD_CLIENT_ID', 'PDD_CLIENT_SECRET'],
    capabilities: ['售前咨询', '订单问题', '平台内承接'],
    privateTrafficPolicy: '仅平台内承接，不直接站外引流',
    notes: '电商平台默认开启站外引导合规拦截。'
  },
  {
    id: 'jd',
    name: '京东客服',
    group: '电商平台',
    adapter: '京东宙斯/咚咚客服 API',
    implemented: false,
    requiredEnv: ['JD_APP_KEY', 'JD_APP_SECRET'],
    capabilities: ['售前咨询', '订单问题', '平台内承接'],
    privateTrafficPolicy: '仅平台内承接，不直接站外引流',
    notes: '电商平台默认开启站外引导合规拦截。'
  },
  {
    id: 'sms',
    name: '短信',
    group: '通信入口',
    adapter: '短信供应商适配层（阿里云/腾讯云/运营商网关）',
    implemented: false,
    requiredEnv: ['SMS_PROVIDER', 'SMS_ACCESS_KEY_ID', 'SMS_ACCESS_KEY_SECRET'],
    capabilities: ['AI 对话入口', '验证码外通知', '人工回访提醒'],
    privateTrafficPolicy: '必须先取得用户授权，保留退订和频控能力',
    notes: '预留短信会话入口，只记录供应商凭证状态，不接真实发送 API。'
  },
  {
    id: 'toutiao',
    name: '头条号/今日头条',
    group: '内容平台',
    adapter: '头条号/今日头条开放能力',
    implemented: false,
    requiredEnv: ['TOUTIAO_APP_ID', 'TOUTIAO_APP_SECRET'],
    capabilities: ['私信咨询', '评论线索', 'AI 对话入口'],
    privateTrafficPolicy: '平台内优先，私域引导需人工确认',
    notes: '预留头条内容场景的消息和线索承接入口。'
  },
  {
    id: 'baijiahao',
    name: '百度百家号',
    group: '内容平台',
    adapter: '百度百家号开放能力',
    implemented: false,
    requiredEnv: ['BAIJIAHAO_APP_ID', 'BAIJIAHAO_APP_SECRET'],
    capabilities: ['私信咨询', '内容线索', 'AI 对话入口'],
    privateTrafficPolicy: '平台内优先，私域引导需人工确认',
    notes: '预留百家号内容咨询和线索沉淀入口。'
  },
  {
    id: 'bilibili',
    name: 'B站',
    group: '内容平台',
    adapter: 'Bilibili 账号消息/互动能力',
    implemented: false,
    requiredEnv: ['BILIBILI_APP_KEY', 'BILIBILI_APP_SECRET'],
    capabilities: ['私信咨询', '评论互动', 'AI 对话入口'],
    privateTrafficPolicy: '平台内优先，私域引导需人工确认',
    notes: '预留 B 站私信和互动线索入口。'
  },
  {
    id: 'zhihu',
    name: '知乎',
    group: '内容平台',
    adapter: '知乎机构号/消息能力',
    implemented: false,
    requiredEnv: ['ZHIHU_CLIENT_ID', 'ZHIHU_CLIENT_SECRET'],
    capabilities: ['私信咨询', '问答线索', 'AI 对话入口'],
    privateTrafficPolicy: '平台内优先，私域引导需人工确认',
    notes: '预留知乎问答和私信咨询入口。'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    group: '海外社交平台',
    adapter: 'LinkedIn Page/Messaging API',
    implemented: false,
    requiredEnv: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    capabilities: ['商务咨询', '潜客线索', 'AI 对话入口'],
    privateTrafficPolicy: '遵守平台政策，跨境触达需人工确认',
    notes: '预留 LinkedIn 商务线索对话入口。'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    group: '海外社交平台',
    adapter: 'Facebook Page Messenger API',
    implemented: false,
    requiredEnv: ['FACEBOOK_PAGE_ID', 'FACEBOOK_PAGE_ACCESS_TOKEN', 'FACEBOOK_VERIFY_TOKEN'],
    capabilities: ['主页私信', '评论线索', 'AI 对话入口'],
    privateTrafficPolicy: '遵守 Meta 平台政策，营销触达需用户授权',
    notes: '预留 Facebook 主页消息和评论承接入口。'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    group: '海外通信入口',
    adapter: 'WhatsApp Business Platform',
    implemented: false,
    requiredEnv: ['WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_BUSINESS_TOKEN'],
    capabilities: ['商务私信', '模板通知', 'AI 对话入口'],
    privateTrafficPolicy: '必须遵守用户同意和模板消息规则',
    notes: '预留 WhatsApp Business 会话入口，只做凭证状态占位。'
  },
  {
    id: 'x-twitter',
    name: 'X/Twitter',
    group: '海外社交平台',
    adapter: 'X API / Direct Messages',
    implemented: false,
    requiredEnv: ['X_TWITTER_API_KEY', 'X_TWITTER_API_SECRET'],
    capabilities: ['私信咨询', '社媒互动', 'AI 对话入口'],
    privateTrafficPolicy: '遵守平台政策，公开互动和私信分开处理',
    notes: '预留 X/Twitter 私信和互动线索入口。'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    group: '海外内容平台',
    adapter: 'TikTok for Business/Open API',
    implemented: false,
    requiredEnv: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    capabilities: ['私信咨询', '评论线索', 'AI 对话入口'],
    privateTrafficPolicy: '平台内优先，跨平台引导需人工确认',
    notes: '预留 TikTok 国际内容场景的 AI 对话入口。'
  }
];

export function listChannelPorts(env = process.env) {
  return portDefinitions.map((port) => {
    const credentialStatus = summarizeCredentials(port.requiredEnv, env);
    return {
      ...port,
      credentialStatus,
      status: resolveStatus(port, credentialStatus)
    };
  });
}

export function summarizeChannelPorts(env = process.env) {
  const ports = listChannelPorts(env);
  return {
    total: ports.length,
    connected: ports.filter((port) => port.status === 'connected').length,
    credentialsReady: ports.filter((port) => port.status === 'credentials_ready').length,
    needsCredentials: ports.filter((port) => port.status === 'needs_credentials').length,
    reserved: ports.filter((port) => port.status === 'reserved').length
  };
}

export function getChannelPort(id, env = process.env) {
  return listChannelPorts(env).find((port) => port.id === id) || null;
}

function summarizeCredentials(requiredEnv, env) {
  const required = requiredEnv.map((key) => ({
    key,
    filled: Boolean(String(env[key] || '').trim())
  }));
  return {
    required,
    filled: required.filter((item) => item.filled).length,
    total: required.length,
    complete: required.length > 0 && required.every((item) => item.filled)
  };
}

function resolveStatus(port, credentialStatus) {
  if (port.implemented) {
    return credentialStatus.complete ? 'connected' : port.statusWhenMissing || 'needs_credentials';
  }
  return credentialStatus.complete ? 'credentials_ready' : 'reserved';
}
