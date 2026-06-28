import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { listChannelPorts } from './channelPorts.js';

const coreSection = {
  id: 'core',
  name: 'AI 知识库基础配置',
  group: '系统基础',
  adapter: 'OpenAI/CCX 兼容接口',
  implemented: true,
  requiredEnv: ['OPENAI_BASE_URL', 'OPENAI_API_KEY', 'OPENAI_MODEL', 'KNOWLEDGE_BASE_NAME', 'BOT_MENTION_NAME'],
  optionalEnv: ['KNOWLEDGE_SYSTEM_PROMPT', 'MAX_REPLY_CHARS'],
  notes: '用于知识库问答、知识图谱和私信话术生成。'
};

const businessIntegrationSections = [
  {
    id: 'ai-call',
    name: 'AI呼叫模块',
    group: '呼叫与成交承接',
    adapter: '呼叫平台 / 外呼 API / 录音转写',
    implemented: false,
    requiredEnv: ['CALL_PROVIDER', 'CALL_API_BASE_URL', 'CALL_API_KEY'],
    optionalEnv: ['CALL_RECORDING_WEBHOOK', 'CALL_TRANSCRIBE_API_URL'],
    notes: '用于 AI 外呼、呼入接待、通话摘要和人工接管；没有授权前只做沙盒配置。'
  },
  {
    id: 'yunke-call-import',
    name: '人工呼叫导入云客',
    group: '呼叫与成交承接',
    adapter: '云客 API / 导入模板',
    implemented: false,
    requiredEnv: ['YUNKE_API_BASE_URL', 'YUNKE_API_TOKEN'],
    optionalEnv: ['YUNKE_IMPORT_TEMPLATE_ID'],
    notes: '用于把人工呼叫记录、意向等级和跟进结果导入云客；真实导入前必须人工确认。'
  },
  {
    id: 'crm-import',
    name: '导入到CRM系统',
    group: '呼叫与成交承接',
    adapter: 'CRM API / 字段映射 / 同步审计',
    implemented: false,
    requiredEnv: ['CRM_API_BASE_URL', 'CRM_API_TOKEN'],
    optionalEnv: ['CRM_FIELD_MAPPING_ID', 'CRM_SYNC_MODE'],
    notes: '用于把线索、客户阶段、标签和成交状态同步到 CRM；真实写入前必须确认字段映射和授权来源。'
  }
];

const agentIntegrationSections = [
  {
    id: 'open-cloud-agent',
    name: 'Open cloud agent',
    group: 'Agent接入中心',
    adapter: 'Open cloud agent API / Webhook / 沙盒任务',
    implemented: false,
    requiredEnv: ['OPEN_CLOUD_AGENT_BASE_URL', 'OPEN_CLOUD_AGENT_TOKEN'],
    optionalEnv: ['OPEN_CLOUD_AGENT_PROJECT_ID', 'OPEN_CLOUD_AGENT_WORKSPACE_ID'],
    notes: '优先推荐接入；默认只做沙盒任务预览，不自动执行外部动作。'
  },
  {
    id: 'hermes-agent',
    name: 'Hermes agent',
    group: 'Agent接入中心',
    adapter: 'Hermes Webhook / 双向指令 / 进度回传',
    implemented: false,
    requiredEnv: ['HERMES_AGENT_WEBHOOK_URL', 'HERMES_AGENT_TOKEN'],
    optionalEnv: ['HERMES_AGENT_CHANNEL'],
    notes: '优先推荐接入；用于收指令、回传进度、阻塞和审批提醒。'
  },
  {
    id: 'custom-agent',
    name: '自定义Agent',
    group: 'Agent接入中心',
    adapter: '自定义 Agent API / 能力白名单 / 审计',
    implemented: false,
    requiredEnv: ['CUSTOM_AGENT_NAME', 'CUSTOM_AGENT_BASE_URL', 'CUSTOM_AGENT_TOKEN'],
    optionalEnv: ['CUSTOM_AGENT_CAPABILITIES', 'CUSTOM_AGENT_WEBHOOK_URL'],
    notes: '可扩展接入销售复盘、知识库、质检、投放等自定义 Agent；默认只读预览。'
  }
];

const optionalEnvBySection = {
  wecom: ['WECOM_WS_URL'],
  sms: ['SMS_TEMPLATE_ID', 'SMS_SIGN_NAME'],
  facebook: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
  whatsapp: ['WHATSAPP_VERIFY_TOKEN'],
  tiktok: ['TIKTOK_REDIRECT_URI']
};

const fieldMeta = {
  WECOM_BOT_ID: ['企业微信机器人 ID', '企业微信后台智能机器人 ID'],
  WECOM_BOT_SECRET: ['企业微信机器人 Secret', '企业微信后台智能机器人密钥'],
  WECOM_WS_URL: ['企业微信长连接地址', '私有部署企业才需要填写'],
  WECHAT_MINIAPP_APP_ID: ['小程序 AppID', '微信小程序后台 AppID'],
  WECHAT_MINIAPP_APP_SECRET: ['小程序 AppSecret', '微信小程序后台 AppSecret'],
  WECHAT_MINIAPP_TOKEN: ['小程序消息 Token', '小程序客服消息回调 Token'],
  EASYCLAW_BASE_URL: ['EasyClaw 地址', '例如 http://127.0.0.1:10027'],
  EASYCLAW_ACCESS_TOKEN: ['EasyClaw Token', 'EasyClaw 本地信使访问令牌'],
  DOUYIN_APP_ID: ['抖音 AppID', '抖音开放平台应用 ID'],
  DOUYIN_APP_SECRET: ['抖音 AppSecret', '抖音开放平台应用密钥'],
  KUAISHOU_APP_ID: ['快手 AppID', '快手开放平台应用 ID'],
  KUAISHOU_APP_SECRET: ['快手 AppSecret', '快手开放平台应用密钥'],
  XHS_APP_ID: ['小红书 AppID', '小红书专业号/开放平台应用 ID'],
  XHS_APP_SECRET: ['小红书 AppSecret', '小红书应用密钥'],
  WECHAT_CHANNELS_APP_ID: ['视频号 AppID', '视频号/微信客服应用 ID'],
  WECHAT_CHANNELS_APP_SECRET: ['视频号 AppSecret', '视频号/微信客服应用密钥'],
  TAOBAO_APP_KEY: ['淘宝 AppKey', '淘宝开放平台 AppKey'],
  TAOBAO_APP_SECRET: ['淘宝 AppSecret', '淘宝开放平台 AppSecret'],
  PDD_CLIENT_ID: ['拼多多 Client ID', '拼多多开放平台 Client ID'],
  PDD_CLIENT_SECRET: ['拼多多 Client Secret', '拼多多开放平台 Client Secret'],
  JD_APP_KEY: ['京东 AppKey', '京东宙斯 AppKey'],
  JD_APP_SECRET: ['京东 AppSecret', '京东宙斯 AppSecret'],
  SMS_PROVIDER: ['短信服务商', '例如 aliyun / tencent / carrier'],
  SMS_ACCESS_KEY_ID: ['短信 AccessKey ID', '短信服务商访问 ID'],
  SMS_ACCESS_KEY_SECRET: ['短信 AccessKey Secret', '短信服务商访问密钥'],
  SMS_TEMPLATE_ID: ['短信模板 ID', '已审核通过的短信模板'],
  SMS_SIGN_NAME: ['短信签名', '已审核通过的短信签名'],
  TOUTIAO_APP_ID: ['头条 AppID', '头条号/今日头条开放能力 AppID'],
  TOUTIAO_APP_SECRET: ['头条 AppSecret', '头条号/今日头条开放能力密钥'],
  BAIJIAHAO_APP_ID: ['百家号 AppID', '百度百家号开放能力 AppID'],
  BAIJIAHAO_APP_SECRET: ['百家号 AppSecret', '百度百家号开放能力密钥'],
  BILIBILI_APP_KEY: ['B站 AppKey', 'Bilibili 开放能力 AppKey'],
  BILIBILI_APP_SECRET: ['B站 AppSecret', 'Bilibili 开放能力密钥'],
  ZHIHU_CLIENT_ID: ['知乎 Client ID', '知乎机构号/开放能力 Client ID'],
  ZHIHU_CLIENT_SECRET: ['知乎 Client Secret', '知乎机构号/开放能力密钥'],
  LINKEDIN_CLIENT_ID: ['LinkedIn Client ID', 'LinkedIn 应用 Client ID'],
  LINKEDIN_CLIENT_SECRET: ['LinkedIn Client Secret', 'LinkedIn 应用密钥'],
  FACEBOOK_PAGE_ID: ['Facebook Page ID', 'Facebook 主页 ID'],
  FACEBOOK_PAGE_ACCESS_TOKEN: ['Facebook Page Token', 'Facebook 主页访问令牌'],
  FACEBOOK_VERIFY_TOKEN: ['Facebook Verify Token', 'Facebook Webhook 校验 Token'],
  FACEBOOK_APP_ID: ['Facebook App ID', 'Meta 应用 ID'],
  FACEBOOK_APP_SECRET: ['Facebook App Secret', 'Meta 应用密钥'],
  WHATSAPP_PHONE_NUMBER_ID: ['WhatsApp 号码 ID', 'WhatsApp Business 电话号码 ID'],
  WHATSAPP_BUSINESS_TOKEN: ['WhatsApp Business Token', 'WhatsApp Business 访问令牌'],
  WHATSAPP_VERIFY_TOKEN: ['WhatsApp Verify Token', 'WhatsApp Webhook 校验 Token'],
  X_TWITTER_API_KEY: ['X/Twitter API Key', 'X API Key'],
  X_TWITTER_API_SECRET: ['X/Twitter API Secret', 'X API Secret'],
  TIKTOK_CLIENT_KEY: ['TikTok Client Key', 'TikTok Client Key'],
  TIKTOK_CLIENT_SECRET: ['TikTok Client Secret', 'TikTok Client Secret'],
  TIKTOK_REDIRECT_URI: ['TikTok Redirect URI', 'TikTok 授权回调地址'],
  OPENAI_BASE_URL: ['知识库接口地址', '例如 http://127.0.0.1:3688/v1'],
  OPENAI_API_KEY: ['知识库接口密钥', 'OpenAI/CCX 兼容接口访问密钥'],
  OPENAI_MODEL: ['知识库模型', '例如 gpt-4.1-mini'],
  KNOWLEDGE_BASE_NAME: ['知识库名称', '例如 奥普C在知识库'],
  KNOWLEDGE_SYSTEM_PROMPT: ['知识库答题规则', '限定回答范围、转人工规则和语气要求'],
  BOT_MENTION_NAME: ['机器人被@名称', '群里 @ 这个名字才触发回答'],
  MAX_REPLY_CHARS: ['最大回复字数', '避免群聊或私信刷屏'],
  CALL_PROVIDER: ['呼叫平台名称', '例如 aliyun-call / tencent-call / 自有呼叫中心'],
  CALL_API_BASE_URL: ['呼叫平台 API 地址', '呼叫平台提供的接口基础地址'],
  CALL_API_KEY: ['呼叫平台 API Key', '呼叫平台提供的访问密钥'],
  CALL_RECORDING_WEBHOOK: ['通话录音回调地址', '呼叫平台推送录音和通话状态的回调地址'],
  CALL_TRANSCRIBE_API_URL: ['通话转写接口', '可选的录音转文字接口地址'],
  YUNKE_API_BASE_URL: ['云客 API 地址', '云客系统提供的接口基础地址'],
  YUNKE_API_TOKEN: ['云客 API Token', '云客系统提供的访问令牌'],
  YUNKE_IMPORT_TEMPLATE_ID: ['云客导入模板 ID', '云客侧配置的导入模板编号'],
  CRM_API_BASE_URL: ['CRM API 地址', 'CRM 系统提供的接口基础地址'],
  CRM_API_TOKEN: ['CRM API Token', 'CRM 系统提供的访问令牌'],
  CRM_FIELD_MAPPING_ID: ['CRM字段映射 ID', 'CRM侧配置的字段映射编号'],
  CRM_SYNC_MODE: ['CRM同步模式', '例如 create_only / upsert / manual_review'],
  OPEN_CLOUD_AGENT_BASE_URL: ['Open cloud agent 地址', 'Open cloud agent 服务后台提供的 API 或 Webhook 地址'],
  OPEN_CLOUD_AGENT_TOKEN: ['Open cloud agent Token', 'Open cloud agent 访问令牌'],
  OPEN_CLOUD_AGENT_PROJECT_ID: ['Open cloud 项目编号', '用于区分项目或应用'],
  OPEN_CLOUD_AGENT_WORKSPACE_ID: ['Open cloud 工作区编号', '用于路由到指定工作区'],
  HERMES_AGENT_WEBHOOK_URL: ['Hermes agent Webhook', 'Hermes 接收指令、进度或阻塞的 Webhook 地址'],
  HERMES_AGENT_TOKEN: ['Hermes agent Token', 'Hermes 访问令牌'],
  HERMES_AGENT_CHANNEL: ['Hermes 频道名称', '用于区分项目、群组或飞书频道'],
  CUSTOM_AGENT_NAME: ['自定义Agent名称', '例如销售复盘Agent、质检Agent、知识库Agent'],
  CUSTOM_AGENT_BASE_URL: ['自定义Agent地址', '自定义 Agent API 或 Webhook 地址'],
  CUSTOM_AGENT_TOKEN: ['自定义Agent Token', '自定义 Agent 访问令牌'],
  CUSTOM_AGENT_CAPABILITIES: ['自定义Agent能力范围', '例如 read_only、draft_only、approval_queue'],
  CUSTOM_AGENT_WEBHOOK_URL: ['自定义Agent回调地址', '用于接收 Agent 处理结果']
};

export function getPlatformConfigEnvPath({ projectDir = process.cwd(), env = process.env } = {}) {
  return env.PLATFORM_CONFIG_ENV_PATH || join(projectDir, '.env');
}

export async function readPlatformConfigEnv(envPath) {
  return parseEnv(await readText(envPath, ''));
}

export async function buildPlatformConfigStatus({ env = process.env, envPath } = {}) {
  const fileEnv = await readPlatformConfigEnv(envPath);
  const mergedEnv = mergeEnv(fileEnv, env);
  const sections = buildSections(mergedEnv);
  const summary = summarizeSections(sections);
  return {
    envPath,
    safety:
      '配置只保存在本机；页面和接口只显示是否已配置，不返回密钥明文。修改后建议重启后台或桌面 App，让真实接入服务重新读取配置。',
    summary,
    sections
  };
}

function mergeEnv(fileEnv, runtimeEnv) {
  const merged = { ...fileEnv };
  for (const [key, value] of Object.entries(runtimeEnv || {})) {
    if (String(value || '').trim()) {
      merged[key] = value;
    }
  }
  return merged;
}

export async function savePlatformConfig({ sectionId, values = {}, env = process.env, envPath }) {
  const status = await buildPlatformConfigStatus({ env, envPath });
  const section = status.sections.find((item) => item.id === sectionId);
  if (!section) {
    throw new Error('没有找到这个平台配置模块。');
  }

  const allowedKeys = new Set(section.fields.map((field) => field.key));
  const updates = {};
  for (const [key, rawValue] of Object.entries(values || {})) {
    if (!allowedKeys.has(key)) {
      throw new Error('包含不允许保存的配置项。');
    }
    const value = normalizeConfigValue(rawValue);
    if (value) {
      updates[key] = value;
    }
  }

  if (!Object.keys(updates).length) {
    throw new Error('请至少填写一个配置项。');
  }

  await writeEnvUpdates(envPath, updates);
  Object.assign(env, updates);

  const refreshed = await buildPlatformConfigStatus({ env, envPath });
  return {
    sectionId,
    savedKeys: Object.keys(updates).map((key) => ({
      key,
      configured: true,
      sensitive: isSensitiveKey(key)
    })),
    config: refreshed
  };
}

function buildSections(env) {
  const channelSections = listChannelPorts(env).map((port) => buildSectionFromPort(port, env));
  return [
    buildSectionFromPort(coreSection, env),
    ...channelSections,
    ...businessIntegrationSections.map((section) => buildSectionFromPort(section, env)),
    ...agentIntegrationSections.map((section) => buildSectionFromPort(section, env))
  ];
}

function buildSectionFromPort(port, env) {
  const keys = [...new Set([...(port.requiredEnv || []), ...(optionalEnvBySection[port.id] || []), ...(port.optionalEnv || [])])];
  const requiredKeys = new Set(port.requiredEnv || []);
  const fields = keys.map((key) => buildField(key, requiredKeys.has(key), env));
  const required = fields.filter((field) => field.required);
  const missingFields = required.filter((field) => !field.configured);
  const missingRequired = missingFields.map((field) => field.key);
  const missingMaterials = missingFields.map((field) => ({
    label: field.label,
    help: field.help,
    sensitive: field.sensitive,
    required: true
  }));
  const filledRequired = required.length - missingRequired.length;
  return {
    id: port.id,
    name: port.name,
    group: port.group,
    adapter: port.adapter,
    implemented: Boolean(port.implemented),
    status: missingRequired.length ? (port.implemented ? 'needs_credentials' : 'reserved') : port.implemented ? 'connected' : 'credentials_ready',
    requiredCount: required.length,
    filledRequired,
    optionalCount: fields.length - required.length,
    missingRequired,
    missingMaterials,
    fields,
    notes: port.notes,
    nextStep: missingRequired.length
      ? `补齐 ${missingMaterials.slice(0, 3).map((item) => item.label).join('、')}${missingMaterials.length > 3 ? ' 等资料' : ''}`
      : port.implemented
        ? '凭证已齐，可以进入真实联调'
        : '凭证已齐，等待平台适配器真实联调'
  };
}

function buildField(key, required, env) {
  const [label, help] = fieldMeta[key] || [key, '平台后台提供的配置项'];
  return {
    key,
    label,
    help,
    required,
    sensitive: isSensitiveKey(key),
    configured: Boolean(String(env[key] || '').trim()),
    placeholder: required ? '必填，保存后只显示已配置' : '选填，留空不修改'
  };
}

function summarizeSections(sections) {
  const totalRequired = sections.reduce((sum, section) => sum + section.requiredCount, 0);
  const filledRequired = sections.reduce((sum, section) => sum + section.filledRequired, 0);
  const missingRequired = sections.reduce((sum, section) => sum + section.missingRequired.length, 0);
  const readySections = sections.filter((section) => section.requiredCount > 0 && section.missingRequired.length === 0).length;
  return {
    totalSections: sections.length,
    readySections,
    totalRequired,
    filledRequired,
    missingRequired,
    percent: totalRequired ? Math.round((filledRequired / totalRequired) * 1000) / 10 : 100
  };
}

function isSensitiveKey(key) {
  return /(SECRET|TOKEN|PASSWORD|ACCESS_KEY|API_KEY|APP_KEY|BUSINESS_TOKEN)$/i.test(key);
}

function normalizeConfigValue(value) {
  return String(value ?? '').trim().slice(0, 4000);
}

async function writeEnvUpdates(envPath, updates) {
  await mkdir(dirname(envPath), { recursive: true });
  const existing = await readText(envPath, '# 黑卫士七维AI营销系统本机配置\n');
  const lines = existing.split(/\r?\n/);
  const remaining = new Set(Object.keys(updates));
  const nextLines = lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)\s*=/);
    if (!match || !remaining.has(match[1])) {
      return line;
    }
    const key = match[1];
    remaining.delete(key);
    return `${key}=${quoteEnvValue(updates[key])}`;
  });

  if (remaining.size) {
    if (nextLines.at(-1)?.trim()) {
      nextLines.push('');
    }
    nextLines.push('# 平台凭证配置中心追加');
    for (const key of remaining) {
      nextLines.push(`${key}=${quoteEnvValue(updates[key])}`);
    }
  }

  const tempPath = `${envPath}.${process.pid}.tmp`;
  await writeFile(tempPath, `${nextLines.join('\n').replace(/\n*$/, '')}\n`, 'utf8');
  await rename(tempPath, envPath);
}

function quoteEnvValue(value) {
  return JSON.stringify(String(value));
}

async function readText(path, fallback) {
  if (!path) {
    return fallback;
  }
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

function parseEnv(content) {
  const env = {};
  for (const line of String(content || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    env[key] = parseEnvValue(rawValue);
  }
  return env;
}

function parseEnvValue(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }
  return value;
}
