const resplitThresholdHours = 12;

const platformTaskDefinitions = [
  ['platforms-wecom', '企业微信 Bot 和群消息接入', '企业微信', 44, 8],
  ['platforms-douyin', '抖音私信/客服端口封装', '抖音', 32, 6],
  ['platforms-wechat-personal', '个人微信端口预留和风险边界', '个人微信', 22, 4],
  ['platforms-wechat-miniapp', '微信小程序客服端口预留', '微信小程序客服', 18, 3],
  ['platforms-kuaishou', '快手客服端口预留', '快手', 15, 4],
  ['platforms-xiaohongshu', '小红书客服端口预留', '小红书', 15, 4],
  ['platforms-wechat-channels', '视频号客服端口预留', '视频号', 14, 4],
  ['platforms-taobao', '淘宝客服平台内承接预留', '淘宝', 12, 5],
  ['platforms-pinduoduo', '拼多多客服平台内承接预留', '拼多多', 12, 5],
  ['platforms-jd', '京东客服平台内承接预留', '京东', 12, 5],
  ['platforms-sms', '短信授权触达端口预留', '短信', 10, 4],
  ['platforms-toutiao', '头条号/今日头条消息端口预留', '头条号/今日头条', 10, 4],
  ['platforms-baijiahao', '百度百家号消息端口预留', '百度百家号', 10, 4],
  ['platforms-bilibili', 'B站私信和互动端口预留', 'B站', 10, 4],
  ['platforms-zhihu', '知乎机构号消息端口预留', '知乎', 10, 4],
  ['platforms-linkedin', 'LinkedIn 商务线索端口预留', 'LinkedIn', 8, 5],
  ['platforms-facebook', 'Facebook 主页消息端口预留', 'Facebook', 8, 5],
  ['platforms-whatsapp', 'WhatsApp Business 会话端口预留', 'WhatsApp', 8, 5],
  ['platforms-x-twitter', 'X/Twitter 私信端口预留', 'X/Twitter', 8, 5],
  ['platforms-tiktok', 'TikTok 国际内容端口预留', 'TikTok', 8, 5]
];

const defaultWorkstreams = [
  {
    id: 'platforms',
    name: 'A 平台接入并行线',
    status: 'active',
    progress: 38,
    remainingHours: 18,
    ownerThread: '平台接入组',
    nextStep: '企业微信优先联调，抖音私信/客服第二位推进',
    mergeGate: '企业微信、抖音模拟回调和端口状态检查通过后合并',
    tasks: platformTaskDefinitions.map((definition) => task(...definition))
  },
  {
    id: 'knowledge-private-message',
    name: 'B 知识库与自动私信并行线',
    status: 'active',
    progress: 78,
    remainingHours: 6,
    ownerThread: '知识库/私信组',
    nextStep: '补行业知识导入、私信审批队列和真实评论样例',
    mergeGate: '私信生成、知识库命中、审批流和安全测试通过后合并',
    tasks: [
      task('knowledge-import', '真实业务知识库导入模板', '知识库', 72, 2),
      task('private-message-approval', '私信话术审批队列', '自动私信', 58, 3),
      task('comment-samples', '留言/私信样例导入', '样例数据', 45, 1)
    ]
  },
  {
    id: 'growth-conversion',
    name: 'C 引流成交并行线',
    status: 'active',
    progress: 64,
    remainingHours: 8,
    ownerThread: '引流成交组',
    nextStep: '把线索分级、跟进建议和复购提醒串成闭环',
    mergeGate: '线索入池、分级、下一步建议和人工确认全部可演示后合并',
    tasks: [
      task('lead-scoring', '高意向线索评分增强', '线索池', 68, 3),
      task('follow-up-loop', '售前售中售后跟单闭环', '客户生命周期', 55, 3),
      task('repurchase-reminder', '复购提醒和客户维护', '复购', 42, 2)
    ]
  },
  {
    id: 'hermes-merge',
    name: 'D Hermes 指令与合并验收并行线',
    status: 'active',
    progress: 70,
    remainingHours: 5,
    ownerThread: 'Hermes/验收组',
    nextStep: '双向指令、阻塞回传、合并门禁和 Demo 检查联动',
    mergeGate: 'Hermes 入站/出站、阻塞回传、全量测试和浏览器验收通过后合并',
    tasks: [
      task('hermes-inbound', 'Hermes 入站指令接收', 'Hermes', 78, 1),
      task('hermes-outbound', '阻塞和资料需求回传', 'Hermes', 52, 2),
      task('merge-verification', '多模块合并验收', '测试', 64, 2)
    ]
  }
];

const outboundTemplates = [
  {
    type: 'blocker',
    title: '阻塞回传',
    text: '我这里卡在【模块】；缺少【资料名称】。请通过 Hermes 回复资料或明确跳过。'
  },
  {
    type: 'progress',
    title: '进度回传',
    text: '当前【模块】进度【百分比】，剩余【小时】小时；下一步是【动作】。'
  },
  {
    type: 'split',
    title: '再拆分回传',
    text: '【模块】剩余时间过长，已拆成【子任务数量】个子任务并行推进。'
  }
];

export function buildOrchestrationPlan({ now = new Date(), workstreamOverrides = {}, blockers = [] } = {}) {
  const workstreams = defaultWorkstreams.map((stream) => {
    const override = workstreamOverrides[stream.id] || {};
    const merged = {
      ...stream,
      ...override,
      progress: clampNumber(override.progress ?? stream.progress, 0, 100),
      remainingHours: Math.max(0, Number(override.remainingHours ?? stream.remainingHours) || 0)
    };
    const childTasks = buildChildTasks(merged);
    const needsResplit = merged.remainingHours >= resplitThresholdHours;

    return {
      ...merged,
      percentText: `${merged.progress.toFixed(1)}%`,
      countdownText: `${merged.remainingHours.toFixed(1)} 小时`,
      needsResplit,
      splitReason: needsResplit ? `剩余 ${merged.remainingHours.toFixed(1)} 小时，超过 ${resplitThresholdHours}.0 小时阈值，需要继续拆分并行。` : '',
      childTasks
    };
  });

  const totalTasks = workstreams.reduce((sum, item) => sum + item.childTasks.length, 0);
  const active = workstreams.filter((item) => item.status === 'active').length;
  const blocked = workstreams.filter((item) => item.status === 'blocked').length;
  const needsResplit = workstreams.filter((item) => item.needsResplit).length;
  const remainingHours = workstreams.reduce((sum, item) => sum + item.remainingHours, 0);
  const progress = workstreams.reduce((sum, item) => sum + item.progress, 0) / workstreams.length;

  return {
    name: '黑卫士七维AI营销系统并行任务调度',
    generatedAt: now.toISOString(),
    summary: {
      progress: Number(progress.toFixed(1)),
      percentText: `${progress.toFixed(1)}%`,
      remainingHours: Number(remainingHours.toFixed(1)),
      countdownText: `${remainingHours.toFixed(1)} 小时`,
      parallelSlots: workstreams.length,
      totalTasks,
      active,
      blocked,
      needsResplit,
      mergePolicy: '每条并行线完成自己的测试和演示后，统一进入合并验收；慢线超过阈值自动再拆。'
    },
    workstreams,
    hermes: {
      directionPolicy: {
        inbound: '用户通过 Hermes 下发任务，先进入收件箱，人工接受后执行。',
        outbound: '系统遇到阻塞或需要用户资料时，通过 Hermes 回传中文指令。'
      },
      inboundChannels: ['Hermes', '后台表单', '脚本命令', '后续消息平台桥接'],
      outboundChannels: ['Hermes 回传队列', '后台提示', '4 小时进度甘特图'],
      outboundTemplates,
      blockers: normalizeBlockers(blockers)
    }
  };
}

function buildChildTasks(stream) {
  if (Array.isArray(stream.childTasks) && stream.childTasks.length) {
    return stream.childTasks.map(normalizeTask);
  }

  return (stream.tasks || []).map(normalizeTask);
}

function task(id, title, module, progress, remainingHours) {
  return {
    id,
    title,
    module,
    progress,
    remainingHours,
    ownerThread: `${module} 子任务`,
    mergeCriteria: `${title} 测试通过，Demo 可讲清楚，风险边界已写入文档。`
  };
}

function normalizeTask(input) {
  const progress = clampNumber(input.progress, 0, 100);
  const remainingHours = Math.max(0, Number(input.remainingHours) || 0);
  return {
    id: cleanText(input.id) || 'task',
    title: cleanText(input.title) || '未命名任务',
    module: cleanText(input.module) || '通用模块',
    progress,
    percentText: `${progress.toFixed(1)}%`,
    remainingHours,
    countdownText: `${remainingHours.toFixed(1)} 小时`,
    ownerThread: cleanText(input.ownerThread) || '未分配',
    mergeCriteria: cleanText(input.mergeCriteria) || '通过测试和人工验收后合并'
  };
}

function normalizeBlockers(blockers) {
  if (!Array.isArray(blockers)) {
    return [];
  }

  return blockers.slice(0, 20).map((blocker) => ({
    id: cleanText(blocker.id),
    moduleId: cleanText(blocker.moduleId),
    title: cleanText(blocker.title),
    missing: normalizeList(blocker.missing),
    nextStep: cleanText(blocker.nextStep)
  }));
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean);
  }

  const text = cleanText(value);
  return text ? [text] : [];
}

function cleanText(value) {
  return String(value || '')
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, '[已脱敏]')
    .replace(/\b(api[_-]?key|secret|token|password)\s*[:=]\s*\S+/gi, '[已脱敏]')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }
  return Math.min(max, Math.max(min, number));
}
