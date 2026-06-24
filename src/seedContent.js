export function defaultKnowledgeItems(now = new Date()) {
  const createdAt = now.toISOString();
  return [
    knowledgeItem({
      id: 'seed-knowledge-first-contact',
      title: '客户首次咨询接待流程',
      category: '售前',
      tags: ['首次咨询', '接待', '开场'],
      scenarios: ['新客户第一次咨询', '私信开场', '群内首次提问'],
      concepts: ['客户需求', '预算', '使用场景', '下一步动作'],
      steps: [
        '先确认客户具体想解决的问题',
        '追问使用场景、预算范围和决策时间',
        '根据客户意向推荐资料、案例或人工顾问',
        '需要承接时先给价值资料，不催促客户'
      ],
      content:
        '首次咨询不要直接推销。先回应客户问题，再用一到两个问题判断需求强度。推荐话术：我先帮你判断方向，你方便说下主要使用场景和大概预算吗？我可以按你的情况给你一份对照资料。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-product-selection',
      title: '客户选型咨询回答框架',
      category: '售前',
      tags: ['选型', '推荐', '怎么选'],
      scenarios: ['客户问怎么选', '客户问哪个好', '客户不知道适不适合'],
      concepts: ['使用场景', '核心需求', '预算', '风险点'],
      steps: [
        '先确认客户的使用场景',
        '确认客户最在意价格、效果、交付还是售后',
        '给出一条明确建议',
        '补充适用条件和不适用情况'
      ],
      content:
        '客户问怎么选时，回答要有结论和判断依据。标准结构：先说建议方向，再说明为什么，最后提醒客户提供场景信息后可以进一步细化。可引导客户领取选型避坑清单。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-price',
      title: '价格报价咨询处理流程',
      category: '售前',
      tags: ['价格', '报价', '多少钱', '费用'],
      scenarios: ['客户问多少钱', '客户要报价', '客户比较预算'],
      concepts: ['报价条件', '需求确认', '方案范围', '预算'],
      steps: [
        '先说明价格需要根据需求确认',
        '询问客户的规模、场景和期望效果',
        '提供报价前需要确认的信息',
        '引导客户领取报价前需求确认表'
      ],
      content:
        '遇到价格问题，不要只回答一个数字。先说明报价和方案范围有关，再让客户补充场景、数量、交付要求和时间。没有确认需求前，只能给区间或报价准备清单。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-case',
      title: '案例咨询承接流程',
      category: '售前',
      tags: ['案例', '效果', '成功客户'],
      scenarios: ['客户想看案例', '客户担心效果', '客户需要信任背书'],
      concepts: ['客户行业', '相似场景', '效果指标', '案例资料'],
      steps: [
        '先确认客户所属行业或场景',
        '说明可以按相似场景提供案例',
        '提醒案例只能作为参考，最终方案要按实际需求判断',
        '引导客户领取客户案例集'
      ],
      content:
        '客户问案例时，要先匹配相似场景，不要乱发不相关案例。回答可以说：我可以按你这个行业/场景找更接近的案例，你先说下你的主要情况，我发你更有参考价值的。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-contract',
      title: '合同签署资料',
      category: '合同',
      tags: ['合同', '签约', '资料'],
      scenarios: ['客户准备签合同', '客户问合同怎么签', '客户补充签约资料'],
      concepts: ['营业执照', '联系人手机号', '开票信息', '合同主体'],
      steps: [
        '确认合同主体名称',
        '准备营业执照',
        '确认联系人姓名和手机号',
        '提交开票信息',
        '确认合同条款后签署'
      ],
      content:
        '合同签署通常需要营业执照、合同主体名称、联系人手机号和开票信息。具体条款或特殊付款方式需要人工确认后再答复。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-after-sales',
      title: '售后问题接待流程',
      category: '售后',
      tags: ['售后', '问题', '投诉', '不满意'],
      scenarios: ['客户反馈问题', '客户投诉', '客户要求售后处理'],
      concepts: ['问题描述', '订单信息', '处理时效', '人工转接'],
      steps: [
        '先表达收到并愿意协助',
        '收集订单号、联系方式和问题截图',
        '判断是否需要技术或人工售后介入',
        '告知客户预计反馈时间'
      ],
      content:
        '售后场景先安抚再收集信息。标准话术：我先帮你记录处理，请发一下订单号/联系方式/问题截图，我会按情况转给对应同事确认。紧急问题请优先人工处理。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-refund',
      title: '退款和差评风险处理',
      category: '售后',
      tags: ['退款', '差评', '投诉', '风险'],
      scenarios: ['客户要求退款', '客户表达不满', '客户可能给差评'],
      concepts: ['情绪安抚', '订单核实', '平台规则', '人工处理'],
      steps: [
        '先承认客户感受并表达处理态度',
        '避免争辩或承诺违规补偿',
        '核实订单和问题原因',
        '转人工按平台规则处理'
      ],
      content:
        '退款和差评风险场景要避免刺激客户。不要争辩，不要私下承诺平台外补偿。先安抚并收集订单信息，再转人工按平台规则处理。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-private-traffic',
      title: '私域资料领取引导',
      category: '私域引流',
      tags: ['资料', '私域', '加企微', '领取'],
      scenarios: ['客户想要资料', '客户有选型需求', '客户想看案例'],
      concepts: ['价值资料', '客户许可', '人工确认', '不频繁打扰'],
      steps: [
        '先说明资料能解决什么问题',
        '让客户主动回复关键词或确认需要',
        '再发送领取方式或转人工',
        '承诺不会频繁打扰'
      ],
      content:
        '私域引导要先给价值，不要强行索要联系方式。推荐话术：我可以给你一份选型/报价/案例资料，你看完会更好判断。你回复“资料”，我发你领取方式。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-ecommerce-compliance',
      title: '电商平台客服合规边界',
      category: '合规',
      tags: ['淘宝', '拼多多', '京东', '合规', '站外引流'],
      scenarios: ['淘宝客服咨询', '拼多多客服咨询', '京东客服咨询', '客户要求加微信'],
      concepts: ['平台内承接', '站外引流', '账号风险', '人工确认'],
      steps: [
        '优先在当前平台客服窗口内回答',
        '不主动引导客户加个人微信或企微',
        '不发送规避平台规则的话术',
        '复杂问题转人工在平台内处理'
      ],
      content:
        '淘宝、拼多多、京东等电商平台默认只做平台内承接。不直接生成加个人微信、加企微、转私域等站外引导话术，避免账号和店铺风险。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-human-handoff',
      title: '需要转人工的情况',
      category: '客服流程',
      tags: ['转人工', '人工确认', '复杂问题'],
      scenarios: ['客户情绪强烈', '涉及合同条款', '涉及退款投诉', 'AI无法确认'],
      concepts: ['人工介入', '风险控制', '客户体验'],
      steps: [
        '判断是否涉及承诺、价格、合同、退款或投诉',
        '无法确认时不要编造答案',
        '说明需要人工确认',
        '记录客户问题和联系方式'
      ],
      content:
        '涉及价格承诺、合同条款、退款投诉、平台违规风险、客户强烈不满时，必须转人工确认。AI 可以先收集信息并安抚客户，但不能替人工做最终承诺。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-platform-tone',
      title: '不同平台客服语气原则',
      category: '客服流程',
      tags: ['语气', '平台', '回复风格'],
      scenarios: ['企业微信群聊', '抖音私信', '小红书私信', '电商客服'],
      concepts: ['简洁', '专业', '不打扰', '平台规则'],
      steps: [
        '企业微信回答要专业直接',
        '内容平台回答要轻一点，先给价值',
        '电商平台回答要围绕订单和平台内咨询',
        '不确定时转人工'
      ],
      content:
        '不同平台语气不同，但底线一致：真实、简洁、有帮助、不夸大、不诱导违规。企业微信偏专业，内容平台偏轻沟通，电商平台偏平台内服务。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-child-allergy-care',
      title: '儿童过敏护理私信承接知识库',
      category: '儿童健康',
      tags: ['儿童过敏', '护理清单', '抖音私信', '母婴账号'],
      scenarios: ['评论后一次性私信', '抖音私信', '进群前资料领取', '家长咨询'],
      concepts: ['儿童过敏', '护理清单', '触发环境', '长期护理', '家人需求'],
      steps: [
        '先确认留言来源和作品主题，说明不是陌生骚扰',
        '判断需求对象是孩子本人、家人还是朋友转问',
        '询问年龄、症状、触发环境和既往处理方式',
        '先提供护理清单或注意事项，不做诊断和疗效承诺',
        '需要深入沟通时邀请到对应平台群或转人工顾问'
      ],
      content:
        '儿童过敏护理类私信要先说明来源，再给家长可核验的资料入口。可以说：看到你在护理清单作品下留言，我先发你一份基础护理清单，里面有触发环境、日常记录和就医前准备。涉及诊断、用药和疗效判断必须提示咨询专业人员，不能承诺治愈。'
    }, createdAt),
    knowledgeItem({
      id: 'seed-knowledge-faq-update',
      title: '知识库更新机制',
      category: '运营',
      tags: ['知识库', '更新', '复盘'],
      scenarios: ['AI回答不准确', '客服发现新问题', '每天复盘'],
      concepts: ['最近消息', '知识补充', '话术优化'],
      steps: [
        '每天查看最近消息和高意向线索',
        '把答不准的问题补成知识库条目',
        '把转化好的回复沉淀成话术',
        '把违规或无效话术标记下线'
      ],
      content:
        '1.0 阶段要边用边完善。每天从最近消息里找回答不好的问题，补进知识库；从高意向线索里找有效话术，补进引流话术库。'
    }, createdAt)
  ];
}

export function defaultGrowthData(now = new Date()) {
  const createdAt = now.toISOString();
  return {
    scripts: [
      growthScript({
        id: 'seed-script-consultant',
        scene: '选型',
        customerStage: '陌生',
        painPoint: '选择困难',
        tone: '顾问',
        goal: '加企微',
        template: '你这个情况先别急着定，我建议先看一份{material}，能少走很多弯路。'
      }, createdAt),
      growthScript({
        id: 'seed-script-case',
        scene: '案例',
        customerStage: '已咨询',
        painPoint: '信任不足',
        tone: '专业',
        goal: '领案例',
        template: '你问的这个点，最好结合真实案例看。我可以发你一份{material}，你对照自己的情况会更清楚。'
      }, createdAt),
      growthScript({
        id: 'seed-script-price',
        scene: '报价',
        customerStage: '已咨询',
        painPoint: '担心预算',
        tone: '顾问',
        goal: '领报价表',
        template: '价格要看具体需求，直接报一个数反而容易不准。我可以先给你一份{material}，你按表填完就能更快得到准确方案。'
      }, createdAt),
      growthScript({
        id: 'seed-script-cooperation',
        scene: '合作',
        customerStage: '高意向',
        painPoint: '想确认合作方式',
        tone: '专业',
        goal: '预约沟通',
        template: '你已经问到合作细节了，我建议让顾问按你的情况做一次确认。我可以先发你{material}，再安排人工接一下。'
      }, createdAt),
      growthScript({
        id: 'seed-script-after-sales',
        scene: '售后安抚',
        customerStage: '已购买',
        painPoint: '遇到问题',
        tone: '安抚',
        goal: '转人工',
        template: '这个问题我先帮你记录处理。你可以把订单号和问题截图发来，我会按{material}里的流程转给对应同事确认。'
      }, createdAt),
      growthScript({
        id: 'seed-script-platform-inner',
        scene: '平台内承接',
        customerStage: '陌生',
        painPoint: '平台合规限制',
        tone: '客服',
        goal: '平台内咨询',
        template: '这个问题可以在当前平台客服窗口继续沟通。我先发你{material}里的关键信息，你看完后直接在这里追问就行。'
      }, createdAt)
    ],
    materials: [
      growthMaterial({
        id: 'seed-material-checklist',
        name: '选型避坑清单',
        type: '资料',
        description: '帮助客户判断型号、场景和常见风险。',
        cta: '回复“资料”领取。'
      }, createdAt),
      growthMaterial({
        id: 'seed-material-casebook',
        name: '客户案例集',
        type: '案例',
        description: '展示不同客户场景下的解决方案。',
        cta: '回复“案例”领取。'
      }, createdAt),
      growthMaterial({
        id: 'seed-material-new-customer',
        name: '新客户入门资料包',
        type: '资料',
        description: '包含基础介绍、常见问题、合作流程和准备资料。',
        cta: '回复“入门”领取。'
      }, createdAt),
      growthMaterial({
        id: 'seed-material-quote-form',
        name: '报价前需求确认表',
        type: '表格',
        description: '用于确认报价前必须明确的场景、数量、预算和交付要求。',
        cta: '回复“报价表”领取。'
      }, createdAt),
      growthMaterial({
        id: 'seed-material-after-sales',
        name: '售后处理信息清单',
        type: '清单',
        description: '整理订单号、联系方式、问题截图和期望处理方式。',
        cta: '请在当前窗口发送订单号和问题截图。'
      }, createdAt)
    ],
    rules: [
      growthRule({
        id: 'seed-rule-select',
        name: '选型咨询',
        keywords: ['怎么选', '推荐', '适合', '哪个好'],
        scene: '选型'
      }, createdAt),
      growthRule({
        id: 'seed-rule-price',
        name: '价格咨询',
        keywords: ['多少钱', '价格', '报价', '费用', '预算'],
        scene: '报价'
      }, createdAt),
      growthRule({
        id: 'seed-rule-case',
        name: '案例兴趣',
        keywords: ['案例', '效果', '成功客户', '有没有客户'],
        scene: '案例'
      }, createdAt),
      growthRule({
        id: 'seed-rule-cooperation',
        name: '合作意向',
        keywords: ['合作', '加盟', '代理', '采购', '下单', '签约'],
        scene: '合作'
      }, createdAt),
      growthRule({
        id: 'seed-rule-after-sales',
        name: '售后安抚',
        keywords: ['售后', '投诉', '退款', '差评', '不满意', '坏了'],
        scene: '售后安抚'
      }, createdAt),
      growthRule({
        id: 'seed-rule-platform-inner',
        name: '平台内承接',
        keywords: ['淘宝', '拼多多', '京东', '店铺', '订单'],
        scene: '平台内承接'
      }, createdAt)
    ],
    leads: []
  };
}

function knowledgeItem(input, createdAt) {
  return {
    ...input,
    createdAt,
    updatedAt: createdAt
  };
}

function growthScript(input, createdAt) {
  return {
    ...input,
    createdAt
  };
}

function growthMaterial(input, createdAt) {
  return {
    ...input,
    createdAt
  };
}

function growthRule(input, createdAt) {
  return {
    ...input,
    enabled: true,
    createdAt
  };
}
