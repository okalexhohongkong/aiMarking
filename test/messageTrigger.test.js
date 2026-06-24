import assert from 'node:assert/strict';
import test from 'node:test';
import { extractQuestion, shouldReplyToMessage } from '../src/messageTrigger.js';

test('extracts a question after an explicit mention', () => {
  assert.equal(extractQuestion('@智能客服 质保多久？', '智能客服'), '质保多久？');
});

test('extracts a question after a name prefix', () => {
  assert.equal(extractQuestion('智能客服：奥普C在怎么使用？', '智能客服'), '奥普C在怎么使用？');
});

test('does not trigger for ordinary group chat', () => {
  assert.equal(extractQuestion('大家看一下这个问题', '智能客服'), null);
});

test('handles nested text payloads from SDK style messages', () => {
  const result = shouldReplyToMessage(
    {
      payload: {
        text: {
          content: '@智能客服 安装需要哪些资料？'
        }
      }
    },
    '智能客服'
  );

  assert.deepEqual(result, { shouldReply: true, question: '安装需要哪些资料？' });
});
