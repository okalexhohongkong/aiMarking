const hourMs = 60 * 60 * 1000;

const moduleDefinitions = [
  {
    id: 'appearance',
    title: '界面设置',
    basePercent: 100,
    plannedHours: 0,
    tone: 'ahead',
    nextStep: '保持可配置'
  },
  {
    id: 'status',
    title: '运行状态',
    basePercent: 100,
    plannedHours: 0,
    tone: 'ahead',
    nextStep: '接入真实平台状态'
  },
  {
    id: 'input-center',
    title: '统一输入中心',
    basePercent: 70,
    plannedHours: 5,
    tone: 'normal',
    nextStep: '接入表格上传和数据库映射'
  },
  {
    id: 'data-import',
    title: '数据导入中心',
    basePercent: 62,
    plannedHours: 8,
    tone: 'normal',
    nextStep: '补客户画像、评论私信样本导入模板'
  },
  {
    id: 'device-ports',
    title: '外设接口',
    basePercent: 46,
    plannedHours: 12,
    tone: 'normal',
    nextStep: '定义手机、语音和平台终端授权边界'
  },
  {
    id: 'api-center',
    title: 'API接口中心',
    basePercent: 52,
    plannedHours: 14,
    tone: 'normal',
    nextStep: '把平台凭证和 Webhook 回调统一成接口清单'
  },
  {
    id: 'voice-input',
    title: 'AI语音输入',
    basePercent: 60,
    plannedHours: 8,
    tone: 'normal',
    nextStep: '接入语音转写后的结构化分发'
  },
  {
    id: 'knowledge',
    title: '知识库',
    basePercent: 88,
    plannedHours: 6,
    tone: 'normal',
    nextStep: '导入真实业务资料'
  },
  {
    id: 'qa',
    title: '问答测试',
    basePercent: 86,
    plannedHours: 4,
    tone: 'normal',
    nextStep: '接真实平台消息'
  },
  {
    id: 'channels',
    title: '多平台客服端口',
    basePercent: 42,
    plannedHours: 18,
    tone: 'normal',
    nextStep: '企业微信第一，抖音第二'
  },
  {
    id: 'simulator',
    title: '端口模拟器',
    basePercent: 82,
    plannedHours: 4,
    tone: 'normal',
    nextStep: '补真实平台回调样例'
  },
  {
    id: 'marketing',
    title: '黑卫士七维AI营销系统',
    basePercent: 62,
    plannedHours: 12,
    tone: 'normal',
    nextStep: '继续保持蓝图，不扩新模块'
  },
  {
    id: 'private-message',
    title: '自动私信生成器',
    basePercent: 72,
    plannedHours: 6,
    tone: 'normal',
    nextStep: '接入真实评论来源和人工确认队列'
  },
  {
    id: 'lifecycle',
    title: '客户生命周期',
    basePercent: 76,
    plannedHours: 5,
    tone: 'normal',
    nextStep: '接入真实线索阶段流转'
  },
  {
    id: 'playbooks',
    title: '私信/评论转化剧本',
    basePercent: 78,
    plannedHours: 5,
    tone: 'normal',
    nextStep: '按行业继续沉淀剧本模板'
  },
  {
    id: 'hermes',
    title: 'Hermes 指令收件箱',
    basePercent: 66,
    plannedHours: 6,
    tone: 'normal',
    nextStep: '接入 Hermes 反向指令脚本'
  },
  {
    id: 'growth',
    title: '私域引流 1.0',
    basePercent: 74,
    plannedHours: 8,
    tone: 'normal',
    nextStep: '保留人工确认'
  },
  {
    id: 'leads',
    title: '高意向线索',
    basePercent: 58,
    plannedHours: 10,
    tone: 'normal',
    nextStep: '接入真实来源后开始沉淀'
  }
];

export function buildProjectProgress({ now = new Date(), env = process.env } = {}) {
  const hasWecomCredentials = Boolean(String(env.WECOM_BOT_ID || '').trim() && String(env.WECOM_BOT_SECRET || '').trim());
  const hasDouyinCredentials = Boolean(String(env.DOUYIN_APP_ID || '').trim() && String(env.DOUYIN_APP_SECRET || '').trim());

  const modules = moduleDefinitions.map((definition) => {
    const overrides = getModuleOverride(definition.id, { hasWecomCredentials, hasDouyinCredentials });
    const tone = overrides.tone || definition.tone;
    const percent = overrides.percent ?? definition.basePercent;
    const remainingHours = overrides.remainingHours ?? definition.plannedHours;

    return {
      id: definition.id,
      title: definition.title,
      percent: clamp(percent, 0, 100),
      percentText: formatProgressPercent(percent),
      remainingHours: Math.max(0, Number(remainingHours) || 0),
      countdownText: formatCountdownHours(remainingHours),
      tone,
      colorLabel: colorLabel(tone),
      nextStep: overrides.nextStep || definition.nextStep,
      updatedAt: now.toISOString()
    };
  });

  const averagePercent = modules.reduce((sum, module) => sum + module.percent, 0) / modules.length;

  return {
    updatedAt: now.toISOString(),
    summary: {
      percent: Number(averagePercent.toFixed(1)),
      percentText: formatProgressPercent(averagePercent),
      remainingHours: modules.reduce((sum, module) => sum + module.remainingHours, 0),
      reportIntervalHours: 4,
      reportCountdownText: '每 4.0 小时自动同步一次',
      normal: modules.filter((module) => module.tone === 'normal').length,
      paused: modules.filter((module) => module.tone === 'paused').length,
      ahead: modules.filter((module) => module.tone === 'ahead').length
    },
    modules
  };
}

export function formatProgressPercent(value) {
  const normalized = clamp(Number(value) || 0, 0, 100);
  return `${normalized.toFixed(1)}%`;
}

function getModuleOverride(id, { hasWecomCredentials, hasDouyinCredentials }) {
  if (id === 'channels') {
    if (!hasWecomCredentials) {
      return {
        tone: 'paused',
        percent: 36,
        remainingHours: 18,
        nextStep: '等待企业微信 Bot ID 和 Secret'
      };
    }

    if (!hasDouyinCredentials) {
      return {
        tone: 'normal',
        percent: 48,
        remainingHours: 14,
        nextStep: '企业微信凭证已备，下一步补抖音凭证'
      };
    }

    return {
      tone: 'ahead',
      percent: 72,
      remainingHours: 8,
      nextStep: '企业微信和抖音凭证已备，进入联调'
    };
  }

  return {};
}

function formatCountdownHours(value) {
  const hours = Math.max(0, Number(value) || 0);
  return `${hours.toFixed(1)} 小时`;
}

function colorLabel(tone) {
  if (tone === 'paused') {
    return '红色暂停';
  }
  if (tone === 'ahead') {
    return '绿色超前';
  }
  return '蓝色正常';
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
