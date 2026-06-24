export function retrieveKnowledge(query, items, { limit = 5 } = {}) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) {
    return [];
  }

  return items
    .map((item) => {
      const titleTokens = tokenize(item.title);
      const tagTokens = tokenize((item.tags || []).join(' '));
      const categoryTokens = tokenize(item.category);
      const scenarioTokens = tokenize((item.scenarios || []).join(' '));
      const conceptTokens = tokenize((item.concepts || []).join(' '));
      const stepTokens = tokenize((item.steps || []).join(' '));
      const contentTokens = tokenize(item.content);
      const searchableText = [
        item.title,
        (item.tags || []).join(' '),
        item.category,
        (item.scenarios || []).join(' '),
        (item.concepts || []).join(' '),
        (item.steps || []).join(' '),
        item.content
      ].join(' ');
      const score =
        scoreTokens(queryTokens, titleTokens, 4) +
        scoreTokens(queryTokens, tagTokens, 3) +
        scoreTokens(queryTokens, categoryTokens, 2) +
        scoreTokens(queryTokens, scenarioTokens, 4) +
        scoreTokens(queryTokens, conceptTokens, 4) +
        scoreTokens(queryTokens, stepTokens, 2) +
        scoreTokens(queryTokens, contentTokens, 1) +
        scoreBusinessKeywords(queryTokens, {
          titleTokens,
          tagTokens,
          categoryTokens,
          scenarioTokens,
          conceptTokens
        }) +
        scorePhrases(query, searchableText) +
        scoreComplianceIntent(query, searchableText);

      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .toSorted((a, b) => b.score - a.score || b.updatedAt?.localeCompare(a.updatedAt || '') || 0)
    .slice(0, limit);
}

export function buildKnowledgeContext(matches) {
  if (!matches.length) {
    return '本地知识库没有命中相关资料。';
  }

  return matches
    .map((item, index) => {
      const tags = item.tags?.length ? `\n标签：${item.tags.join('、')}` : '';
      const category = item.category ? `\n分类：${item.category}` : '';
      const scenarios = item.scenarios?.length ? `\n适用场景：${item.scenarios.join('、')}` : '';
      const concepts = item.concepts?.length ? `\n关键概念：${item.concepts.join('、')}` : '';
      const steps = item.steps?.length ? `\n处理步骤：${item.steps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join('；')}` : '';
      return `资料 ${index + 1}：${item.title}${category}${tags}${scenarios}${concepts}${steps}\n${item.content}`;
    })
    .join('\n\n---\n\n');
}

function scoreTokens(queryTokens, targetTokens, weight) {
  const target = new Set(targetTokens);
  return queryTokens.reduce((score, token) => score + (target.has(token) ? weight : 0), 0);
}

function scorePhrases(query, target) {
  const queryText = String(query || '').toLowerCase();
  const targetText = String(target || '').toLowerCase();
  const phrases = queryText.match(/[\p{Script=Han}]{2,}|[a-z0-9]{3,}/gu) || [];
  return phrases.reduce((score, phrase) => score + (targetText.includes(phrase) ? Math.min(12, phrase.length) : 0), 0);
}

function scoreBusinessKeywords(queryTokens, targetGroups) {
  const keywords = queryTokens.filter(isBusinessKeyword);
  if (!keywords.length) {
    return 0;
  }

  return keywords.reduce(
    (score, token) =>
      score +
      scoreKeyword(token, targetGroups.titleTokens, 14) +
      scoreKeyword(token, targetGroups.tagTokens, 14) +
      scoreKeyword(token, targetGroups.categoryTokens, 7) +
      scoreKeyword(token, targetGroups.scenarioTokens, 8) +
      scoreKeyword(token, targetGroups.conceptTokens, 8),
    0
  );
}

function scoreKeyword(token, targetTokens, weight) {
  return new Set(targetTokens).has(token) ? weight : 0;
}

function scoreComplianceIntent(query, target) {
  const queryText = String(query || '').toLowerCase();
  const targetText = String(target || '').toLowerCase();
  const mentionsEcommerce = /淘宝|天猫|拼多多|京东|电商|店铺|订单/.test(queryText);
  const mentionsOffPlatform = /加微信|个人微信|加企微|私域|站外|联系方式/.test(queryText);
  if (!mentionsEcommerce || !mentionsOffPlatform) {
    return 0;
  }

  return /合规|站外引流|平台内承接|账号风险|不直接/.test(targetText) ? 30 : 0;
}

function isBusinessKeyword(token) {
  if (!/^[\p{Script=Han}]{2,}$/u.test(token)) {
    return false;
  }

  const genericQuestionWords = new Set([
    '怎么',
    '如何',
    '什么',
    '多少',
    '多久',
    '哪里',
    '哪个',
    '有没有',
    '能不能',
    '可以',
    '需要',
    '客户',
    '问题',
    '资料'
  ]);
  return !genericQuestionWords.has(token);
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/)
    .flatMap(splitMixedToken)
    .filter(Boolean);
}

function splitMixedToken(token) {
  const chunks = token.match(/[\p{Script=Han}]+|[a-z0-9]+/gu) || [];
  return chunks.flatMap((chunk) => {
    if (/^[\p{Script=Han}]+$/u.test(chunk)) {
      return chineseBigrams(chunk);
    }
    return [chunk];
  });
}

function chineseBigrams(value) {
  if (value.length <= 2) {
    return [value];
  }

  const tokens = [value];
  for (const char of value) {
    tokens.push(char);
  }
  for (let index = 0; index < value.length - 1; index += 1) {
    tokens.push(value.slice(index, index + 2));
  }
  return tokens;
}
