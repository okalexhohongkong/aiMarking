import assert from 'node:assert/strict';
import test from 'node:test';
import { formatReply } from '../src/replyFormatter.js';

test('uses a fallback when the answer is empty', () => {
  assert.match(formatReply(''), /没有在知识库里找到可靠答案/);
});

test('truncates long replies', () => {
  const reply = formatReply('一'.repeat(100), 30);
  assert.ok(reply.length <= 45);
  assert.match(reply, /已自动截断/);
});
