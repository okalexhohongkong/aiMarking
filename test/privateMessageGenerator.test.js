import assert from 'node:assert/strict';
import test from 'node:test';
import { generatePrivateMessageContext } from '../src/privateMessageGenerator.js';

const requiredOutputFields = [
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

test('generates a complete one-time private message context from comment signals', () => {
  const result = generatePrivateMessageContext({
    platform: '企业微信',
    customerName: '林女士',
    ipProvince: '广东',
    ipCity: '深圳',
    postPlatform: '小红书',
    postLocation: '深圳本地账号',
    postTitle: '深圳孩子过敏体质如何做长期护理',
    postPublishedAt: '2026-06-20T09:10:00+08:00',
    commentedAt: '2026-06-22T20:35:00+08:00',
    commentText: '我家孩子也反复过敏，想要一份护理清单',
    contentRelation: '留言提到孩子反复过敏，与作品里的长期护理方案直接相关',
    sentiment: 'positive',
    genderGuess: 'female',
    needOwner: '家人',
    solution: '儿童过敏体质长期护理咨询',
    offer: '免费领取护理清单，首次咨询减免 30 元',
    officialSiteUrl: 'https://example.com/verify',
    groupInviteUrl: 'https://example.com/group',
    contactUrl: 'https://example.com/contact',
    companyVerification: '企业名称和资质可在官网与企业信息公示系统核验',
    knowledgeMatches: [
      {
        title: '儿童过敏护理知识库',
        category: '儿童健康',
        scenarios: ['评论后一次性私信', '进群前资料领取'],
        concepts: ['护理清单', '长期护理']
      }
    ],
    apiKey: 'sk-should-not-leak'
  });

  for (const field of requiredOutputFields) {
    assert.equal(typeof result[field], 'string', `${field} should be a string`);
    assert.ok(result[field].trim(), `${field} should not be empty`);
  }

  const combined = requiredOutputFields.map((field) => result[field]).join('\n');
  assert.match(combined, /林女士/);
  assert.match(combined, /广东深圳/);
  assert.match(combined, /小红书/);
  assert.match(combined, /深圳本地账号/);
  assert.match(combined, /深圳孩子过敏体质如何做长期护理/);
  assert.match(combined, /2026-06-20/);
  assert.match(combined, /2026-06-22/);
  assert.match(combined, /我家孩子也反复过敏/);
  assert.match(combined, /家人/);
  assert.match(combined, /儿童过敏体质长期护理咨询/);
  assert.match(combined, /免费领取护理清单/);
  assert.match(result.signalAssessment, /广东深圳/);
  assert.match(result.signalAssessment, /家人/);
  assert.match(result.signalAssessment, /女/);
  assert.match(result.sourceTrace, /公开作品|公开互动|来源/);
  assert.match(result.sendReadiness, /可发送|一次性私信/);
  assert.match(result.knowledgeRouting, /已命中|儿童过敏护理知识库/);
  assert.match(result.knowledgeFocus, /儿童过敏护理知识库/);
  assert.match(result.verificationChecklist, /官网|企查查|企业信用|公开渠道/);
  assert.match(result.invitationTarget, /企业微信群|平台群/);
  assert.match(result.invitationDecision, /企业微信群|平台群/);
  assert.match(combined, /https:\/\/example\.com\/verify/);
  assert.match(combined, /https:\/\/example\.com\/group|https:\/\/example\.com\/contact/);
  assert.doesNotMatch(combined, /诈骗|欺骗|压制|sk-should-not-leak|apiKey/i);
  assert.doesNotMatch(result.identityIntro, /咨询咨询/);
});

test('handles negative comments with comfort and clarification before any next step', () => {
  const result = generatePrivateMessageContext({
    platform: '抖音私信',
    customerName: '周先生',
    ipProvince: '浙江',
    ipCity: '杭州',
    postPlatform: '抖音',
    postLocation: '杭州服务号',
    postTitle: '甲醛治理后多久能入住',
    postPublishedAt: '2026-06-18',
    commentedAt: '2026-06-22',
    commentText: '你们说得太绝对了，我之前治理完还是有味道',
    contentRelation: '留言质疑治理效果，与作品里的入住时间判断有关',
    sentiment: 'negative',
    genderGuess: 'male',
    needOwner: '本人',
    solution: '室内空气检测复核和治理方案排查',
    offer: '可以先免费看检测报告，必要时给一份复核清单',
    officialSiteUrl: 'https://example.com/air',
    groupInviteUrl: 'https://example.com/air-group',
    contactUrl: 'https://example.com/air-contact',
    companyVerification: '营业执照、检测流程和服务资质可公开查询'
  });

  const combined = requiredOutputFields.map((field) => result[field]).join('\n');
  assert.match(result.needHypothesis, /可能|不确定|先确认/);
  assert.match(result.valueHook, /先|澄清|复核|报告|原因/);
  assert.match(result.sendReadiness, /可以发送澄清型私信|暂缓邀约/);
  assert.match(result.invitationTarget, /当前私信|人工/);
  assert.match(result.invitationDecision, /不建议直接邀约进群|先.*澄清/);
  assert.match(result.primaryCta, /看一下|确认|澄清|复核|报告/);
  assert.match(result.riskNotes, /负面|安抚|澄清|不硬推/);
  assert.doesNotMatch(result.message, /下单|成交|付款|定金|马上买/);
  assert.match(combined, /你们说得太绝对了/);
  assert.match(combined, /浙江杭州/);
  assert.match(combined, /杭州服务号/);
  assert.doesNotMatch(combined, /诈骗|欺骗|压制|secret|token|api[_-]?key/i);
});

test('uses safe fallbacks when optional links, dates, and owner are missing', () => {
  const result = generatePrivateMessageContext({
    customerName: '',
    postTitle: '新手避坑指南',
    postPublishedAt: '',
    commentedAt: '昨天晚上',
    commentText: '能发资料吗',
    needOwner: '同事',
    officialSiteUrl: 'javascript:alert(1)',
    contactUrl: 'ftp://example.com/contact',
    groupInviteUrl: '',
    secret: 'secret=do-not-leak'
  });

  const combined = requiredOutputFields.map((field) => result[field]).join('\n');
  assert.match(result.contextSummary, /时间未记录/);
  assert.match(result.contextSummary, /昨天晚上/);
  assert.match(result.needHypothesis, /未知/);
  assert.match(result.knowledgeFocus, /新手避坑指南|相关咨询|资料/);
  assert.match(result.knowledgeRouting, /暂未命中|人工补充/);
  assert.match(result.sendReadiness, /需人工复核|谨慎/);
  assert.match(result.invitationDecision, /确认需求|回复/);
  assert.match(result.primaryCta, /回复“资料”/);
  assert.match(result.fallbackCta, /稍后联系/);
  assert.match(result.trustProof, /公开渠道核验/);
  assert.doesNotMatch(combined, /javascript:|ftp:\/\/|do-not-leak|secret=/i);
});

test('keeps negative fallback link-free when no trusted link is provided', () => {
  const result = generatePrivateMessageContext({
    customerName: '赵先生',
    postTitle: '服务流程说明',
    commentText: '这个流程让我很失望',
    sentiment: 'negative',
    needOwner: '本人',
    contactUrl: 'not-a-url',
    groupInviteUrl: 'not-a-url'
  });

  assert.match(result.primaryCta, /发来/);
  assert.match(result.primaryCta, /澄清复核/);
  assert.doesNotMatch(result.primaryCta, /not-a-url/);
  assert.doesNotMatch(result.message, /下单|成交|付款|定金|马上买/);
});

test('keeps ecommerce messages inside the original platform before off-platform invitation', () => {
  const result = generatePrivateMessageContext({
    platform: '淘宝客服',
    customerName: '王女士',
    ipProvince: '上海',
    ipCity: '上海',
    postPlatform: '淘宝',
    postTitle: '旗舰店活动',
    commentText: '能加微信发优惠券吗？',
    contentRelation: '客户询问优惠券，与店铺活动相关',
    sentiment: 'positive',
    needOwner: '本人',
    solution: '店铺优惠咨询',
    offer: '平台内可领取的优惠券',
    groupInviteUrl: 'https://example.com/group',
    contactUrl: 'https://example.com/contact'
  });

  assert.match(result.sendReadiness, /平台内|人工确认/);
  assert.match(result.invitationTarget, /淘宝客服|平台内/);
  assert.match(result.invitationDecision, /电商平台|平台内客服|站外/);
  assert.match(result.primaryCta, /平台内客服|已确认入口|当前平台客服/);
  assert.doesNotMatch(result.message, /马上加微信|绕过平台|规避平台/);
});
