const ecommercePlatforms = new Set(['淘宝', '天猫', '拼多多', '京东']);

export function scoreLead({ message, platform, interactionCount = 1 }) {
  const text = String(message || '');
  let score = 0;
  const signals = [];

  addSignal(/多少钱|价格|报价|费用|预算/.test(text), '价格咨询', 18);
  addSignal(/案例|效果|成功|客户/.test(text), '案例兴趣', 18);
  addSignal(/合作|加盟|代理|采购|下单/.test(text), '合作意向', 28);
  addSignal(/怎么选|推荐|适合|哪个好/.test(text), '选型需求', 18);
  addSignal(/资料|清单|方案|表格|对照/.test(text), '资料需求', 15);
  addSignal(/售后|投诉|退款|差评|不满意/.test(text), '风险诉求', 8);

  if (interactionCount >= 2) {
    score += 12;
    signals.push('连续互动');
  }

  if (platform === '企业微信' || platform === '个人微信') {
    score += 5;
  }

  return {
    score: Math.min(100, score),
    level: score >= 70 ? '高意向' : score >= 35 ? '中意向' : '低意向',
    signals
  };

  function addSignal(condition, label, points) {
    if (condition) {
      score += points;
      signals.push(label);
    }
  }
}

export function generateGrowthReply({
  message,
  platform,
  customerStage = '陌生',
  goal = '加企微',
  interactionCount = 1,
  rules = [],
  scripts = [],
  materials = []
}) {
  if (isDisallowedGoal(platform, goal)) {
    return {
      allowed: false,
      requiresHumanApproval: true,
      reason: '平台合规限制：电商平台不建议直接引导到站外私域，请改用收藏、咨询、下单或平台内客服承接。',
      reply: ''
    };
  }

  const lead = scoreLead({ message, platform, interactionCount });
  const matchedRule = matchRule(message, rules);
  const material = pickMaterial({ message, materials, scene: matchedRule?.scene });
  const script = pickScript({ scripts, scene: matchedRule?.scene, customerStage, goal });
  const reply = renderReply({
    template: script?.template,
    material,
    platform,
    goal,
    message
  });

  return {
    allowed: true,
    requiresHumanApproval: true,
    reason: '私域引流话术已生成，建议人工确认后发送。',
    reply,
    lead,
    matchedRule,
    material,
    script
  };
}

function isDisallowedGoal(platform, goal) {
  return ecommercePlatforms.has(platform) && /个人微信|加微信|加企微|私域/.test(goal);
}

function matchRule(message, rules) {
  const text = String(message || '');
  return rules.find((rule) => {
    if (rule.enabled === false) {
      return false;
    }
    return (rule.keywords || []).some((keyword) => keyword && text.includes(keyword));
  }) || null;
}

function pickMaterial({ message, materials, scene }) {
  const text = String(message || '');
  return materials.find((material) => text.includes(material.name)) ||
    materials.find((material) => scene && materialMatchesScene(material, scene)) ||
    materials.find((material) => /案例|效果|成功|客户/.test(text) && /案例|客户|效果/.test(materialText(material))) ||
    materials.find((material) => /合作|加盟|代理|采购|下单/.test(text) && /合作|案例|报价|需求/.test(materialText(material))) ||
    materials.find((material) => /多少钱|价格|报价|费用|预算/.test(text) && /报价|价格|费用|预算|需求/.test(materialText(material))) ||
    materials.find((material) => /售后|投诉|退款|差评|不满意/.test(text) && /售后|订单|问题|处理/.test(materialText(material))) ||
    materials.find((material) => /怎么选|推荐|适合|哪个好/.test(text) && /选型|避坑|对照/.test(`${material.name}${material.description}`)) ||
    materials[0] ||
    null;
}

function materialMatchesScene(material, scene) {
  const text = materialText(material);
  const sceneMatchers = {
    选型: /选型|避坑|对照|场景/,
    报价: /报价|价格|费用|预算|需求/,
    案例: /案例|客户|效果/,
    合作: /合作|案例|报价|需求/,
    售后安抚: /售后|订单|问题|处理/,
    平台内承接: /平台|客服|订单|说明/
  };
  return (sceneMatchers[scene] || new RegExp(scene)).test(text);
}

function materialText(material) {
  return `${material?.name || ''}${material?.type || ''}${material?.description || ''}${material?.cta || ''}`;
}

function pickScript({ scripts, scene, customerStage, goal }) {
  return scripts.find((script) => script.scene === scene && script.customerStage === customerStage && script.goal === goal) ||
    scripts.find((script) => script.scene === scene) ||
    scripts[0] ||
    null;
}

function renderReply({ template, material, platform, goal }) {
  const materialName = material?.name || '资料清单';
  const cta = material?.cta || defaultCta(platform, goal);
  const baseTemplate = template || '你这个问题很多人都会卡住，我可以先给你一份{material}，你看完会更好判断。';

  return [
    baseTemplate.replaceAll('{material}', materialName).replaceAll('{cta}', cta),
    cta,
    '我这边不会频繁打扰你，你需要再继续问就行。'
  ].filter(Boolean).join('\n');
}

function defaultCta(platform, goal) {
  if (platform === '企业微信') {
    return goal === '加企微' ? '你可以回复“资料”，我发你领取方式。' : '你可以回复“了解”，我继续发你。';
  }
  return '你可以回复“资料”，我发你更详细的说明。';
}
