export const aiMarketingSystemName = '黑卫士七维AI营销系统';

export const marketingModuleStatus = {
  planned: '规划中',
  ready: '可配置',
  active: '已接入 1.0'
};

const marketingModules = [
  {
    id: 'content-capture',
    order: 1,
    name: '头部内容智能捕捉与分析',
    shortName: '内容捕捉',
    status: 'planned',
    objective: '持续收集各平台高表现内容，提取结构、卖点、情绪钩子、选题角度和平台算法信号。',
    inputs: ['头部视频链接', '爆款图文', '竞品账号内容', '平台热榜', '产品与服务卖点'],
    outputs: ['内容拆解报告', '爆点摘要', '标题结构', '人群痛点', '升级版文案 brief'],
    capabilities: ['头部内容采集', '视频文案重点提取', '亮点与钩子识别', '平台算法信号分析', '产品卖点融合'],
    safeguards: ['只学习结构和表达策略，不搬运原文', '保留来源记录', '涉及竞品数据只做公开信息分析'],
    kpis: ['有效选题数', '爆点命中率', '可二创 brief 数']
  },
  {
    id: 'content-remix',
    order: 2,
    name: '原创升级内容裂变',
    shortName: '内容裂变',
    status: 'planned',
    objective: '基于头部内容结构生成原创视频脚本、图文海报、标题和故事背景变体，形成可审核的内容素材池。',
    inputs: ['内容拆解报告', '产品卖点', '目标人群', '平台风格要求', '禁用表达清单'],
    outputs: ['原创短视频脚本', '图文海报文案', '标题库', '故事背景库', '变体质量评分'],
    capabilities: ['原创脚本生成', '多标题裂变', '故事背景改写', '平台风格适配', '重复度和低质风险检查'],
    safeguards: ['避免逐句仿写和侵权表达', '每条内容进入人工审核', '控制重复度和夸大承诺'],
    kpis: ['原创变体数', '审核通过率', '重复风险拦截数']
  },
  {
    id: 'matrix-publishing',
    order: 3,
    name: '内容矩阵发布与分发',
    shortName: '矩阵分发',
    status: 'planned',
    objective: '把审核通过的优质内容分发到多平台、多账号、多时间段，追踪评论、私信、资料领取等意向动作。',
    inputs: ['审核通过素材', '账号矩阵', '发布日历', '平台规则', '素材标签'],
    outputs: ['发布任务', '平台发布记录', '互动数据', '意向线索入口'],
    capabilities: ['多账号排期', '分平台素材适配', '发布批次管理', '互动数据回收', '账号风险提示'],
    safeguards: ['遵守平台频率限制', '发布前人工确认', '账号权限分级', '失败任务可追溯'],
    kpis: ['发布成功率', '互动率', '私信/留资转化率']
  },
  {
    id: 'comment-intent',
    order: 4,
    name: '留言评论私信管理与意向分级',
    shortName: '留言分级',
    status: 'ready',
    objective: '统一收集自有账号和可见竞品账号评论、留言、私信，按意向等级、情绪、地域、时间和类型分组。',
    inputs: ['评论', '留言', '私信', '资料领取记录', '公开互动数据'],
    outputs: ['高意向线索', '中意向线索', '普通互动', '负面风险', '分组触达队列'],
    capabilities: ['意向评分', '情绪识别', '地域与时间分组', '负面攻击识别', '分批触达队列'],
    safeguards: ['敏感个人信息最小化保存', '负面留言优先人工处理', '陌生人触达频率限制'],
    kpis: ['线索识别准确率', '高意向数量', '负面响应时效']
  },
  {
    id: 'dm-conversation',
    order: 5,
    name: '智能私信邀约与陌生人对话',
    shortName: '智能私信',
    status: 'ready',
    objective: '对有许可或有明确互动的人群生成个性化私信开场，给价值、下钩子、促使对方愿意进入下一轮对话。',
    inputs: ['留言内容', '作品主题', '用户意向等级', '私信知识库', '自我介绍模板', '权益与资料'],
    outputs: ['私信开场建议', '下一轮追问', '资料钩子', '人工审核任务', '对话阶段记录'],
    capabilities: ['陌生人开场白', '人群心理钩子', '价值资料匹配', '多轮追问建议', '人设自我介绍'],
    safeguards: ['不批量骚扰陌生用户', '不虚假承诺', '不诱导违规站外跳转', '发送前默认人工确认'],
    kpis: ['首轮回复率', '二轮对话率', '人工通过率']
  },
  {
    id: 'ai-customer-service',
    order: 6,
    name: '智能客服知识库与知识图谱对话',
    shortName: '智能客服',
    status: 'active',
    objective: '把从评论和私信引来的人群承接到群、企微、个人微信或平台内客服，用行业知识库和知识图谱建立信任并推动成交。',
    inputs: ['作品内容', '评论上下文', '私信上下文', '行业知识库', '知识图谱', '平台客服端口'],
    outputs: ['结构化回答', '转人工建议', '信任建立路径', '成交前问题清单'],
    capabilities: ['多平台客服端口', '知识库问答', '知识图谱推理', '群内 @ 触发', '人工确认机制'],
    safeguards: ['高风险承诺转人工', '行业知识来源可追溯', '电商平台内承接', '隐私数据不外泄'],
    kpis: ['问题解决率', '转人工准确率', '入群/留资转化率']
  },
  {
    id: 'conversion-guidance',
    order: 7,
    name: '智能引流引导成交',
    shortName: '成交引导',
    status: 'ready',
    objective: '把进群观众、读者、患者和准用户分层培育，引导到商城付费、定金、到院、到店或人工顾问成交。',
    inputs: ['群内互动', '客服对话记录', '意向等级', '成交规则', '优惠权益', '预约入口'],
    outputs: ['成交路径建议', '付款/定金引导', '到店/到院预约', '跟进提醒', '成交复盘'],
    capabilities: ['成交阶段识别', '优惠权益匹配', '预约引导', '跟进节奏建议', '复购和转介绍提示'],
    safeguards: ['医疗/金融等高风险行业需人工审核', '不夸大疗效或收益', '付款动作需明确用户同意'],
    kpis: ['预约率', '定金转化率', '成交率', '复购率']
  }
];

const pipelineEdges = [
  ['content-capture', 'content-remix', '爆款结构与产品卖点进入原创裂变'],
  ['content-remix', 'matrix-publishing', '审核通过素材进入矩阵分发'],
  ['matrix-publishing', 'comment-intent', '互动数据进入留言私信分级'],
  ['comment-intent', 'dm-conversation', '按意向队列生成私信邀约'],
  ['dm-conversation', 'ai-customer-service', '有回复的人进入客服承接'],
  ['ai-customer-service', 'conversion-guidance', '建立信任后进入成交引导']
];

export function listMarketingModules() {
  return marketingModules.map((module) => ({
    ...module,
    statusLabel: marketingModuleStatus[module.status] || module.status
  }));
}

export function getMarketingSystemBlueprint() {
  const modules = listMarketingModules();
  return {
    name: aiMarketingSystemName,
    subtitle: '从内容捕捉、原创裂变、矩阵分发、留言分级、智能私信、智能客服到成交引导的闭环系统。',
    modules,
    pipelineEdges,
    summary: {
      total: modules.length,
      active: modules.filter((module) => module.status === 'active').length,
      ready: modules.filter((module) => module.status === 'ready').length,
      planned: modules.filter((module) => module.status === 'planned').length
    },
    compliancePrinciples: [
      '学习爆款内容的结构和策略，不复制原文、画面或侵权素材。',
      '批量发布、批量私信、站外引导默认需要人工确认和频率限制。',
      '电商平台优先平台内承接，医疗、金融等高风险行业必须人工审核关键承诺。',
      '用户数据按最小必要原则保存，线索分级服务于跟进，不做隐私滥用。'
    ],
    nextBuildSteps: [
      '先把留言分级、智能私信、智能客服和成交引导接入当前 1.0 后台。',
      '再接内容采集与原创裂变，形成可审核素材池。',
      '最后接矩阵发布和多账号数据回收，形成全链路运营看板。'
    ]
  };
}
