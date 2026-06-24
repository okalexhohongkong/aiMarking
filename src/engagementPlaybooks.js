const scenarioOrder = [
  'comment-one-time-private-message',
  'replied-repeat-private-dialogue',
  'platform-private-dialogue-without-friend',
  'private-domain-handoff',
  'owned-account-comment-replies',
  'negative-comment-handling'
];

const engagementPlaybooks = {
  summary: {
    name: '私信/评论转化场景蓝图',
    purpose: '把评论互动、平台私信和社群承接整理为可配置的数据模型，供人工确认后的客服转化流程复用。',
    scenarioOrder,
    corePrinciples: [
      '先说明身份和来源，再说明可提供的帮助',
      '用户主动回复后才进入连续对话',
      '尊重用户停留在平台内沟通的选择',
      '进入群或好友承接后继续以资料、方案和人工答疑提供价值',
      '公开评论区以真实、准确、克制的方式回应'
    ]
  },
  playbooks: [
    {
      id: 'comment-one-time-private-message',
      name: '评论后一次性私信',
      scope: '用户在内容评论区留言或互动后的一次首次私信',
      goal: '让用户知道我们是谁、为什么联系他，并用低压力方式邀请他回复。',
      contactPolicy: {
        maxProactivePrivateMessages: 1,
        canRepeatAfterUserReply: false,
        requiresHumanApproval: true,
        stopWhen: '用户未回复、明确拒绝、平台限制触达，均停止继续主动私信。'
      },
      messageElements: [
        {
          id: 'identity',
          label: '说明身份',
          guidance: '开头明确我是哪个账号或品牌的客服/顾问。',
          example: '你好，我是这个账号的客服小助手。'
        },
        {
          id: 'intent',
          label: '说明来意',
          guidance: '用一句话说明想帮他解决刚才提到的问题。',
          example: '想把你刚才关心的选型问题补充说明清楚。'
        },
        {
          id: 'contact-reason',
          label: '说明为什么找你',
          guidance: '解释联系原因来自他的公开留言或互动，不制造紧迫感。',
          example: '因为你在评论里问到预算和适合方案，所以我只发这一条补充信息。'
        },
        {
          id: 'interaction-source',
          label: '说明留言/互动的来源',
          guidance: '点明来自哪条内容、哪个评论区或哪个活动入口。',
          example: '来源是你刚在「客户服务方案」那条内容下的留言。'
        },
        {
          id: 'value-offer',
          label: '说明解决方案/资料/优惠',
          guidance: '把能提供的解决方案、资料或合规优惠说具体。',
          example: '我们可以发你场景对照表、案例资料和当前公开活动权益，方便你自己判断。'
        },
        {
          id: 'safety-verification',
          label: '说明安全确认方式',
          guidance: '给出官网、认证账号、企业主体、订单页或公开资料入口，让对方确认不是诈骗。',
          example: '你可以先看主页认证、官网企业主体和公开联系方式，确认不是诈骗后再回复。'
        },
        {
          id: 'reply-guidance',
          label: '引导回复',
          guidance: '给一个简单关键词或开放问题，让对方决定是否继续聊。',
          example: '需要的话回复“资料”或直接说你的场景，我再继续聊。'
        }
      ],
      recommendedTemplate: '你好，我是这个账号的客服小助手。看到你在「{content}」下留言问到{topic}，我只发这一条补充说明：我们可以提供{offer}。你可以先通过主页认证、官网企业主体和公开联系方式确认不是诈骗；需要的话回复“资料”或直接说你的场景，我再继续聊。'
    },
    {
      id: 'replied-repeat-private-dialogue',
      name: '对方回复后的反复私信对话',
      scope: '用户已经主动回复私信、继续提问或表达兴趣',
      goal: '在平台允许范围内连续答疑、补资料、判断意向，并在必要时转人工。',
      contactPolicy: {
        maxProactivePrivateMessages: null,
        canRepeatAfterUserReply: true,
        requiresHumanApproval: true,
        stopWhen: '用户表示不需要、长时间无回应、问题进入投诉或价格承诺等敏感场景时转人工。'
      },
      actions: [
        '先复述用户问题，确认理解是否准确',
        '按一次一个主题补充方案、资料、案例或公开活动信息',
        '记录用户关注点、预算、使用场景和下一步意愿',
        '高意向或复杂问题交给人工跟进'
      ],
      valueHooks: ['方案对照', '案例资料', '公开活动权益', '人工答疑']
    },
    {
      id: 'platform-private-dialogue-without-friend',
      name: '不加好友的平台内反复沟通',
      scope: '用户不愿加好友，但愿意继续在抖音、小红书等平台私信里沟通',
      goal: '尊重用户留在平台内的选择，在原平台完成答疑、资料发送和意向沉淀。',
      contactPolicy: {
        requiresFriendship: false,
        canRepeatAfterUserReply: true,
        requiresHumanApproval: true,
        stopWhen: '用户不再回复或平台会话到达限制时暂停，等待用户再次发起。'
      },
      actions: [
        '明确可以就在当前平台继续沟通',
        '把资料拆成平台可发送的短说明、图片或链接',
        '用平台内客服入口、收藏、关注或预约能力承接后续',
        '只在用户主动要求时再介绍企业微信或社群承接'
      ],
      dataToCapture: ['平台昵称', '来源内容', '关注问题', '资料偏好', '下次跟进方式']
    },
    {
      id: 'private-domain-handoff',
      name: '好友/社群承接',
      scope: '用户同意加好友，或进入企业微信群、个人微信群、抖音群、小红书群',
      goal: '把平台互动平稳承接到可持续服务空间，继续提供资料、方案和人工答疑。',
      contactPolicy: {
        canRepeatAfterUserReply: true,
        requiresHumanApproval: true,
        requiresConsentBeforeInvite: true,
        stopWhen: '用户拒绝入群、退群或要求停止跟进时立即停止主动承接。'
      },
      handoffTargets: [
        {
          name: '企业微信群',
          fit: '适合正式服务、企业主体背书、多人答疑和售后跟进。',
          firstAction: '欢迎后发送群规则、资料目录和人工服务时间。'
        },
        {
          name: '个人微信群',
          fit: '适合轻量社群、老客户交流和活动通知。',
          firstAction: '说明群主题、发言边界和退出方式。'
        },
        {
          name: '抖音群',
          fit: '适合短视频内容粉丝、直播前后答疑和平台内活动承接。',
          firstAction: '同步相关视频、直播预约和平台内客服入口。'
        },
        {
          name: '小红书群',
          fit: '适合种草内容、经验交流、清单资料和案例讨论。',
          firstAction: '置顶资料清单、常见问题和真实案例链接。'
        }
      ],
      actions: [
        '入群前说明群用途、服务主体和退群方式',
        '入群后先给资料目录，不连续追问成交',
        '把用户来源、诉求和已发送资料同步给人工',
        '对价格、承诺、售后争议等问题安排人工确认'
      ]
    },
    {
      id: 'owned-account-comment-replies',
      name: '自有账号评论区广泛回复',
      scope: '自有账号评论区',
      goal: '在公开评论区高覆盖回应真实问题，同时把适合深入沟通的人引导到平台私信或客服入口。',
      contactPolicy: {
        canReplyPublicly: true,
        requiresHumanApproval: false,
        requiresEscalationForSensitiveCases: true,
        stopWhen: '同一用户反复表达拒绝或问题涉及隐私、订单、争议时停止公开展开，转入合规客服入口。'
      },
      actions: [
        '优先公开回复高频、真实、可泛化的问题',
        '回复内容给出可验证事实、资料入口或客服入口',
        '对相似问题使用不同角度的自然表达，避免机械重复',
        '涉及隐私、价格承诺、售后争议时提醒走客服入口'
      ],
      replyTypes: ['问题解答', '资料入口', '案例补充', '活动说明', '客服入口']
    },
    {
      id: 'negative-comment-handling',
      name: '负面评论处理',
      scope: '自有账号下的质疑、误解、不满、投诉类评论',
      goal: '用合规澄清、安抚、事实说明和优质内容承接降低误解，保护用户体验和品牌可信度。',
      contactPolicy: {
        canReplyPublicly: true,
        requiresHumanApproval: true,
        requiresEscalationForSensitiveCases: true,
        stopWhen: '出现订单隐私、退款争议、人身攻击、法律风险或用户要求停止沟通时，转人工和正式客服流程。'
      },
      actions: [
        '合规澄清：先承认对方感受，再说明可核验的信息边界',
        '安抚：表达理解，给出客服入口和处理时效',
        '事实说明：引用公开规则、订单记录或服务流程中可披露的部分',
        '优质内容承接：补充教程、案例、常见问题或售后说明，让旁观用户获得有效信息'
      ],
      escalationSignals: ['退款争议', '售后投诉', '隐私信息', '法律风险', '媒体询问'],
      reviewChecklist: [
        '是否只陈述可核验事实',
        '是否避免情绪化回应',
        '是否保护用户隐私',
        '是否给出正式客服入口',
        '是否需要人工复核后发布'
      ]
    }
  ],
  complianceRules: [
    {
      id: 'consent-first',
      name: '同意优先',
      guidance: '只有在用户留言、主动回复或用户授权后才继续沟通；用户拒绝或沉默时停止主动触达。'
    },
    {
      id: 'truthful-claims',
      name: '真实准确',
      guidance: '身份、企业主体、来源、资料、活动权益和服务能力必须真实准确，不夸大结果。'
    },
    {
      id: 'frequency-control',
      name: '频控和退出',
      guidance: '限制主动触达次数，控制间隔，并在私信、群和客服流程中保留退出或停止跟进方式。'
    },
    {
      id: 'human-review',
      name: '人工确认',
      guidance: '首次私信、负面评论、价格承诺、售后争议和跨平台承接建议人工确认或人工复核。'
    },
    {
      id: 'platform-boundary',
      name: '平台边界',
      guidance: '遵守各平台私信、评论、群聊和客服入口规则；用户愿意留在平台内时优先平台内承接。'
    }
  ]
};

export function getEngagementPlaybooks() {
  return structuredClone(engagementPlaybooks);
}
