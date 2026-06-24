import assert from 'node:assert/strict';
import test from 'node:test';
import { KnowledgeClient } from '../src/knowledgeClient.js';

test('sends question to an OpenAI-compatible chat completion endpoint', async () => {
  const calls = [];
  const client = new KnowledgeClient({
    baseUrl: 'http://127.0.0.1:3688/v1',
    apiKey: 'test-key',
    model: 'test-model',
    knowledgeBaseName: '奥普C在知识库',
    systemPrompt: '只根据知识库回答',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return Response.json({
        choices: [{ message: { content: '这是知识库答案。' } }]
      });
    }
  });

  const answer = await client.answer('如何安装？', { sender: 'zhangsan', roomId: 'room-1' });

  assert.equal(answer, '这是知识库答案。');
  assert.equal(calls[0].url, 'http://127.0.0.1:3688/v1/chat/completions');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-key');

  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.model, 'test-model');
  assert.match(body.messages[0].content, /奥普C在知识库/);
  assert.match(body.messages[1].content, /如何安装/);
});

test('throws when the knowledge endpoint fails', async () => {
  const client = new KnowledgeClient({
    baseUrl: 'http://example.test/v1',
    apiKey: 'test-key',
    model: 'test-model',
    knowledgeBaseName: '奥普C在知识库',
    systemPrompt: '只根据知识库回答',
    fetchImpl: async () => new Response('bad gateway', { status: 502 })
  });

  await assert.rejects(() => client.answer('问题'), /502/);
});
