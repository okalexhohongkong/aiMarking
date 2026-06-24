import assert from 'node:assert/strict';
import test from 'node:test';
import { retrieveKnowledge } from '../src/retriever.js';
import { defaultKnowledgeItems } from '../src/seedContent.js';

test('ranks knowledge items by query overlap with title, tags, and content', () => {
  const items = [
    {
      id: '1',
      title: '售后流程',
      content: '售后问题请联系服务台。',
      tags: ['售后']
    },
    {
      id: '2',
      title: '合同签署',
      content: '合同签署需要营业执照、联系人和开票信息。',
      tags: ['合同', '安装']
    }
  ];

  const results = retrieveKnowledge('安装合同需要什么资料', items, { limit: 2 });
  assert.equal(results[0].id, '2');
  assert.ok(results[0].score > 0);
});

test('returns an empty list when there is no useful query text', () => {
  assert.deepEqual(retrieveKnowledge('   ', [{ id: '1', title: 'A', content: 'B', tags: [] }]), []);
});

test('prioritizes ecommerce compliance when a query mentions ecommerce and off-platform contact', () => {
  const items = [
    {
      id: 'private',
      title: '私域资料领取引导',
      content: '私域引导要先给价值，不要强行索要联系方式。',
      tags: ['资料', '私域', '加企微']
    },
    {
      id: 'ecommerce',
      title: '电商平台客服合规边界',
      content: '淘宝、拼多多、京东等电商平台默认只做平台内承接，不直接生成加个人微信、加企微、转私域等站外引导话术。',
      tags: ['淘宝', '拼多多', '京东', '合规', '站外引流'],
      scenarios: ['客户要求加微信']
    }
  ];

  const results = retrieveKnowledge('客户问淘宝能不能加微信发资料', items, { limit: 2 });
  assert.equal(results[0].id, 'ecommerce');
});

test('prioritizes ecommerce compliance in the default knowledge set', () => {
  const results = retrieveKnowledge('客户问淘宝能不能加微信发资料，怎么回答？', defaultKnowledgeItems(), { limit: 3 });
  assert.equal(results[0].title, '电商平台客服合规边界');
});

test('prioritizes clear business keywords over generic question wording', () => {
  const items = [
    {
      id: 'selection',
      title: '客户选型咨询回答框架',
      content: '客户问怎么选时，回答要有结论和判断依据。',
      tags: ['选型', '推荐', '怎么选'],
      scenarios: ['客户问怎么选'],
      concepts: ['使用场景'],
      steps: ['先确认客户的使用场景']
    },
    {
      id: 'contract',
      title: '合同签署资料',
      content: '合同签署需要营业执照、联系人手机号和开票信息。',
      tags: ['合同', '安装']
    }
  ];

  const results = retrieveKnowledge('合同怎么签？', items, { limit: 2 });
  assert.equal(results[0].id, 'contract');
});
