const outputFields = [
  'identityIntro',
  'reasonForContact',
  'sourceTrace',
  'contextSummary',
  'sendReadiness',
  'signalAssessment',
  'knowledgeRouting',
  'knowledgeFocus',
  'needHypothesis',
  'trustProof',
  'verificationChecklist',
  'valueHook',
  'offerLine',
  'invitationTarget',
  'invitationDecision',
  'primaryCta',
  'fallbackCta',
  'riskNotes',
  'message'
];

const negativeSignals = [
  'negative',
  '负面',
  '差评',
  '质疑',
  '投诉',
  '不满',
  '生气',
  '失望',
  '太绝对',
  '没用',
  '有味道',
  '不好'
];

export function generatePrivateMessageContext(input = {}) {
  const context = normalizeContext(input);
  const isNegative = detectNegativeSentiment(context.sentiment, context.commentText);
  const isCommerce = detectCommercePlatform(context);

  const identityIntro = buildIdentityIntro(context);
  const reasonForContact = buildReasonForContact(context, isNegative);
  const sourceTrace = buildSourceTrace(context);
  const contextSummary = buildContextSummary(context, isNegative);
  const sendReadiness = buildSendReadiness(context, { isNegative, isCommerce });
  const signalAssessment = buildSignalAssessment(context, isNegative);
  const knowledgeRouting = buildKnowledgeRouting(context);
  const knowledgeFocus = buildKnowledgeFocus(context);
  const needHypothesis = buildNeedHypothesis(context, isNegative);
  const trustProof = buildTrustProof(context);
  const verificationChecklist = buildVerificationChecklist(context);
  const valueHook = buildValueHook(context, isNegative);
  const offerLine = buildOfferLine(context, isNegative);
  const invitationTarget = buildInvitationTarget(context, { isNegative, isCommerce });
  const invitationDecision = buildInvitationDecision(context, { isNegative, isCommerce });
  const primaryCta = buildPrimaryCta(context, { isNegative, isCommerce });
  const fallbackCta = buildFallbackCta(context, { isNegative, isCommerce });
  const riskNotes = buildRiskNotes({ isNegative, isCommerce });
  const message = buildMessage({
    context,
    isNegative,
    isCommerce,
    identityIntro,
    reasonForContact,
    sourceTrace,
    contextSummary,
    sendReadiness,
    signalAssessment,
    knowledgeRouting,
    knowledgeFocus,
    needHypothesis,
    trustProof,
    verificationChecklist,
    valueHook,
    offerLine,
    invitationTarget,
    invitationDecision,
    primaryCta,
    fallbackCta
  });

  return redactOutput({
    identityIntro,
    reasonForContact,
    sourceTrace,
    contextSummary,
    sendReadiness,
    signalAssessment,
    knowledgeRouting,
    knowledgeFocus,
    needHypothesis,
    trustProof,
    verificationChecklist,
    valueHook,
    offerLine,
    invitationTarget,
    invitationDecision,
    primaryCta,
    fallbackCta,
    riskNotes,
    message
  });
}

function normalizeContext(input) {
  return {
    platform: cleanText(input.platform) || '平台私信',
    customerName: cleanText(input.customerName) || '您好',
    ipProvince: cleanText(input.ipProvince),
    ipCity: cleanText(input.ipCity),
    postPlatform: cleanText(input.postPlatform) || '内容平台',
    postLocation: cleanText(input.postLocation),
    postTitle: cleanText(input.postTitle) || '相关作品',
    postPublishedAt: formatDate(input.postPublishedAt),
    commentedAt: formatDate(input.commentedAt),
    commentText: cleanText(input.commentText) || '您在作品下留下了评论',
    contentRelation: cleanText(input.contentRelation),
    sentiment: cleanText(input.sentiment) || 'unknown',
    genderGuess: cleanText(input.genderGuess) || 'unknown',
    needOwner: normalizeNeedOwner(input.needOwner),
    solution: cleanText(input.solution) || '相关咨询',
    offer: cleanText(input.offer) || '一份整理好的资料',
    officialSiteUrl: cleanUrl(input.officialSiteUrl),
    groupInviteUrl: cleanUrl(input.groupInviteUrl),
    contactUrl: cleanUrl(input.contactUrl),
    companyVerification: cleanText(input.companyVerification) || '机构信息和资质可通过公开渠道核验',
    knowledgeMatches: normalizeKnowledgeMatches(input.knowledgeMatches)
  };
}

function buildIdentityIntro(context) {
  return `我是负责${context.solution}相关问题承接的工作人员，主要在${context.platform}处理来自公开作品互动后的问题。`;
}

function buildReasonForContact(context, isNegative) {
  const action = isNegative ? '先向您确认情况' : '把资料和下一步入口发给您';
  return `联系您是因为您在${context.postPlatform}作品《${context.postTitle}》下留言，我看到这条公开互动后，想${action}。`;
}

function buildSourceTrace(context) {
  const region = formatRegion(context) || '地域/IP未记录';
  const location = context.postLocation ? `，作品/账号位置：${context.postLocation}` : '';
  return `来源：${context.postPlatform}公开作品《${context.postTitle}》${location}；互动：${context.commentedAt}留言“${context.commentText}”；地域/IP：${region}。这条私信只基于这次公开互动发起。`;
}

function buildContextSummary(context, isNegative) {
  const region = formatRegion(context);
  const relation = context.contentRelation || '这条留言与作品主题有直接关联';
  const sentimentLabel = isNegative ? '偏负面或带质疑' : '偏正向或有明确兴趣';
  return `${region ? `${region}的` : ''}${context.customerName}，这条作品发布于${context.postPublishedAt}，您在${context.commentedAt}留言：“${context.commentText}”。${relation}，当前情绪判断为${sentimentLabel}。`;
}

function buildSendReadiness(context, { isNegative, isCommerce }) {
  const hasRelation = Boolean(context.contentRelation);
  const hasKnowledge = context.knowledgeMatches.length > 0;
  const hasVerification = Boolean(context.officialSiteUrl || context.companyVerification);
  const hasNextStep = Boolean(context.groupInviteUrl || context.contactUrl);

  if (isNegative) {
    return '可以发送澄清型私信，但暂缓邀约进群；重点是安抚、复核事实、让对方先把具体情况说清楚。';
  }

  if (isCommerce) {
    return '可作为平台内客服承接建议；涉及站外联系或加群必须人工确认平台规则后再发送。';
  }

  if (hasRelation && hasKnowledge && hasVerification && hasNextStep) {
    return '可发送一次性私信：来源清楚、留言与作品相关、知识库已命中、核验和下一步入口齐全。';
  }

  const missing = [
    hasRelation ? '' : '留言和作品关系',
    hasKnowledge ? '' : '专门知识库',
    hasVerification ? '' : '正规核验说明',
    hasNextStep ? '' : '加群或联系入口'
  ].filter(Boolean);
  return `需人工复核后谨慎发送：${missing.join('、')}还不完整。`;
}

function buildSignalAssessment(context, isNegative) {
  const region = formatRegion(context) || '地域未记录';
  const gender = formatGender(context.genderGuess);
  const relation = context.contentRelation || '需要人工再判断留言和作品的直接关系';
  const sentiment = isNegative ? '负面/质疑，先澄清再承接' : formatSentiment(context.sentiment);
  const owner = context.needOwner === '未知' ? '需求对象未确认' : `需求对象：${context.needOwner}`;

  return [
    `地域/IP：${region}`,
    `作品来源：${context.postPlatform}《${context.postTitle}》${context.postLocation ? `，作品/账号位置：${context.postLocation}` : ''}，发布时间：${context.postPublishedAt}`,
    `留言时间：${context.commentedAt}`,
    `留言关系：${relation}`,
    `情绪：${sentiment}`,
    `性别判断：${gender}`,
    owner
  ].join('；');
}

function buildKnowledgeRouting(context) {
  if (!context.knowledgeMatches.length) {
    return `暂未命中专门知识库；建议人工补充《${context.postTitle}》对应行业知识、常见问题、禁忌承诺和可领取资料后再发送。`;
  }

  const titles = context.knowledgeMatches.slice(0, 3).map((item) => item.title).join('、');
  const categories = [...new Set(context.knowledgeMatches.map((item) => item.category).filter(Boolean))].slice(0, 3);
  return `已命中 ${context.knowledgeMatches.length} 条知识：${titles}${categories.length ? `；优先调用分类：${categories.join('、')}` : ''}。`;
}

function buildKnowledgeFocus(context) {
  if (context.knowledgeMatches.length) {
    return context.knowledgeMatches
      .slice(0, 3)
      .map((item, index) => {
        const parts = [
          item.category ? `分类：${item.category}` : '',
          item.scenarios.length ? `场景：${item.scenarios.join('、')}` : '',
          item.concepts.length ? `概念：${item.concepts.join('、')}` : ''
        ].filter(Boolean);
        return `${index + 1}. ${item.title}${parts.length ? `（${parts.join('；')}）` : ''}`;
      })
      .join('；');
  }

  return `暂未命中专门知识库，先围绕《${context.postTitle}》、留言“${context.commentText}”和${context.solution}生成谨慎承接话术，发送前建议补充业务知识。`;
}

function buildNeedHypothesis(context, isNegative) {
  if (isNegative) {
    return `我不先下结论，您可能是${context.needOwner}遇到了实际效果或信息不一致的问题，需要先确认具体情况和原因。`;
  }

  return `初步判断您可能是在帮${context.needOwner}了解${context.solution}，希望先拿到清晰步骤、适用条件和可联系的正规入口。`;
}

function buildTrustProof(context) {
  const officialLine = context.officialSiteUrl
    ? `可先看官方核验入口：${context.officialSiteUrl}。`
    : '可先通过公开渠道核验机构信息。';

  return `${context.companyVerification}，${officialLine}`;
}

function buildVerificationChecklist(context) {
  return [
    context.companyVerification || '企业主体、服务资质和公开联系方式',
    context.officialSiteUrl ? `官网/官方核验入口：${context.officialSiteUrl}` : '官网或官方公开入口',
    '企业信用信息公示系统或企查查等公开渠道',
    context.contactUrl ? `人工联系入口：${context.contactUrl}` : '平台内客服或人工确认入口'
  ].join('；');
}

function buildValueHook(context, isNegative) {
  if (isNegative) {
    return `我可以先帮您澄清作品里没有讲透的部分，按您的留言把报告、过程或实际原因逐项复核，先解决疑问再决定是否继续沟通。`;
  }

  return `我可以按您在《${context.postTitle}》里的留言，先给一份和${context.solution}相关的资料，方便您快速判断是否适合。`;
}

function buildOfferLine(context, isNegative) {
  const prefix = isNegative ? '先不推方案，' : '';
  return `${prefix}可以给您${context.offer}。`;
}

function buildInvitationTarget(context, { isNegative, isCommerce }) {
  if (isNegative) {
    return '当前私信窗口，必要时转人工复核，不直接进群。';
  }

  if (isCommerce) {
    return `${context.postPlatform || context.platform}平台内客服；站外群或个人联系方式需人工确认。`;
  }

  if (context.groupInviteUrl) {
    return buildGroupTarget(context);
  }

  if (context.contactUrl) {
    return '人工联系入口';
  }

  return '当前私信窗口，先让对方回复“资料”确认意愿。';
}

function buildInvitationDecision(context, { isNegative, isCommerce }) {
  if (isNegative) {
    return '不建议直接邀约进群；先在当前私信里安抚、澄清、复核事实，等对方愿意继续沟通后再邀请进入深度交流。';
  }

  if (isCommerce) {
    return '电商平台优先在平台内客服承接，不建议直接站外邀约；如平台规则允许，再由人工确认是否进入店铺客服、品牌群或售后群。';
  }

  if (context.groupInviteUrl) {
    return `建议邀请到${buildGroupTarget(context)}做深度交流，并保留“继续在当前私信沟通”的备用选择。`;
  }

  return '暂时没有可用群链接，先让对方回复“资料”或联系人工，确认需求后再邀请进入对应平台群。';
}

function buildPrimaryCta(context, { isNegative, isCommerce }) {
  const link = context.contactUrl || context.groupInviteUrl;

  if (isNegative) {
    return link
      ? `方便的话，您可以先把具体情况或报告发到这里，我们先看一下并做澄清复核：${link}`
      : '方便的话，您可以先把具体情况或报告发来，我们先看一下并做澄清复核。';
  }

  if (isCommerce) {
    return context.contactUrl
      ? `您可以先通过平台内客服或这个已确认入口继续咨询：${context.contactUrl}`
      : '您可以先在当前平台客服窗口回复“资料”，我安排人工按平台规则继续跟进。';
  }

  if (context.groupInviteUrl) {
    return `您可以先进${buildGroupTarget(context)}领取资料并提问：${context.groupInviteUrl}`;
  }

  return link ? `也可以直接从这里联系人工领取资料：${link}` : '也可以直接回复“资料”，我安排人工继续跟进。';
}

function buildFallbackCta(context, { isNegative, isCommerce }) {
  if (isNegative) {
    return '如果暂时不方便继续聊，您也可以只回复最困扰的一点，我先按这一点帮您确认。';
  }

  if (isCommerce) {
    return '如果暂时不方便继续咨询，也可以先收藏当前客服窗口，后续在平台内找我们确认。';
  }

  if (context.contactUrl && context.groupInviteUrl) {
    return `如果不想进群，也可以直接联系人工：${context.contactUrl}`;
  }

  return '如果现在不方便打开链接，也可以直接回复“资料”或“稍后联系”。';
}

function buildRiskNotes({ isNegative, isCommerce }) {
  const base = '仅基于公开互动生成一次性私信建议；发送前建议人工确认，不夸大承诺，不索要敏感信息。';

  if (isNegative) {
    return `${base} 负面评论先安抚和澄清，不硬推成交。`;
  }

  if (isCommerce) {
    return `${base} 电商平台优先平台内承接，站外引导必须先确认平台规则。`;
  }

  return `${base} 正向评论也要保持来源透明和频率克制。`;
}

function buildMessage({
  context,
  isNegative,
  isCommerce,
  identityIntro,
  reasonForContact,
  sourceTrace,
  contextSummary,
  sendReadiness,
  signalAssessment,
  knowledgeRouting,
  knowledgeFocus,
  needHypothesis,
  trustProof,
  verificationChecklist,
  valueHook,
  offerLine,
  invitationTarget,
  invitationDecision,
  primaryCta,
  fallbackCta
}) {
  const greeting = context.customerName === '您好' ? '您好' : `${context.customerName}您好`;
  const region = formatRegion(context);
  const regionLine = region ? `看到您这边显示在${region}，情况可能也会受本地环境和时间影响。` : '';

  if (isNegative) {
    return [
      `${greeting}，打扰您一下。${identityIntro}`,
      `${reasonForContact}${regionLine}`,
      `${sourceTrace}`,
      `我看到您的留言是“${context.commentText}”，理解您会有顾虑。${contextSummary}`,
      `发送前判断：${sendReadiness}`,
      `我这边先按这些信息判断：${signalAssessment}`,
      `知识库路由：${knowledgeRouting}`,
      `会优先参考这类知识：${knowledgeFocus}`,
      `${needHypothesis}${valueHook}`,
      `${trustProof}${offerLine}`,
      `核验清单：${verificationChecklist}`,
      `建议承接位置：${invitationTarget}。${invitationDecision}`,
      `${primaryCta}`,
      `${fallbackCta}`
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `${greeting}，打扰您一下。${identityIntro}`,
    `${reasonForContact}${regionLine}`,
    `${sourceTrace}`,
    `${contextSummary}`,
    `发送前判断：${sendReadiness}`,
    `我这边先按这些信息判断：${signalAssessment}`,
    `知识库路由：${knowledgeRouting}`,
    `会优先参考这类知识：${knowledgeFocus}`,
    `${needHypothesis}${valueHook}`,
    `${trustProof}${offerLine}`,
    `核验清单：${verificationChecklist}`,
    `建议承接位置：${invitationTarget}。${invitationDecision}`,
    `${primaryCta}`,
    `${fallbackCta}`
  ]
    .filter(Boolean)
    .join('\n');
}

function detectNegativeSentiment(sentiment, commentText) {
  const haystack = `${sentiment} ${commentText}`.toLowerCase();
  return negativeSignals.some((signal) => haystack.includes(signal.toLowerCase()));
}

function detectCommercePlatform(context) {
  return /淘宝|天猫|拼多多|京东|电商|店铺/.test(`${context.platform} ${context.postPlatform}`);
}

function buildGroupTarget(context) {
  const text = `${context.platform} ${context.postPlatform}`;
  if (/企业微信|企微|微信群/.test(text)) {
    return '企业微信群';
  }
  if (/抖音/.test(text)) {
    return '抖音群';
  }
  if (/小红书/.test(text)) {
    return '小红书群';
  }
  if (/快手/.test(text)) {
    return '快手群';
  }
  if (/视频号/.test(text)) {
    return '视频号社群';
  }
  return '对应平台群';
}

function formatGender(value) {
  const text = cleanText(value).toLowerCase();
  if (['female', '女', '女士'].includes(text)) {
    return '女';
  }
  if (['male', '男', '先生'].includes(text)) {
    return '男';
  }
  return '未知';
}

function formatSentiment(value) {
  const text = cleanText(value).toLowerCase();
  if (/positive|正向|兴趣|需要|想要/.test(text)) {
    return '正向/有兴趣';
  }
  if (/neutral|中性|询问|unknown|未知/.test(text)) {
    return '中性/需继续确认';
  }
  return cleanText(value) || '未知';
}

function cleanText(value) {
  return redactSensitive(String(value ?? ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanUrl(value) {
  const text = cleanText(value);
  if (!text) {
    return '';
  }

  if (!/^https?:\/\//i.test(text)) {
    return '';
  }

  return text;
}

function normalizeNeedOwner(value) {
  const text = cleanText(value);
  return ['本人', '家人', '朋友', '未知'].includes(text) ? text : '未知';
}

function normalizeKnowledgeMatches(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, 5)
    .map((item) => ({
      title: cleanText(item?.title).slice(0, 120),
      category: cleanText(item?.category).slice(0, 80),
      scenarios: normalizeTextList(item?.scenarios).slice(0, 5),
      concepts: normalizeTextList(item?.concepts).slice(0, 5)
    }))
    .filter((item) => item.title);
}

function normalizeTextList(value) {
  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean);
  }

  const text = cleanText(value);
  return text ? [text] : [];
}

function formatDate(value) {
  const text = cleanText(value);
  if (!text) {
    return '时间未记录';
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return text;
  }

  return parsed.toISOString().slice(0, 10);
}

function formatRegion(context) {
  return [context.ipProvince, context.ipCity].filter(Boolean).join('');
}

function redactOutput(output) {
  return outputFields.reduce((result, field) => {
    result[field] = redactSensitive(output[field]);
    return result;
  }, {});
}

function redactSensitive(value) {
  return String(value ?? '')
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, '[已脱敏]')
    .replace(/\b(api[_-]?key|secret|token|password)\s*[:=]\s*\S+/gi, '[已脱敏]');
}
