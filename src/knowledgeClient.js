export class KnowledgeClient {
  constructor({ baseUrl, apiKey, model, knowledgeBaseName, systemPrompt, fetchImpl = fetch }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.knowledgeBaseName = knowledgeBaseName;
    this.systemPrompt = systemPrompt;
    this.fetchImpl = fetchImpl;
  }

  async answer(question, context = {}) {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: [
              this.systemPrompt,
              `当前知识库：${this.knowledgeBaseName}`,
              context.knowledgeContext ? `本地命中的知识库资料：\n${context.knowledgeContext}` : '',
              context.graphContext ? `知识图谱关系：\n${context.graphContext}` : '',
              '如果问题超出知识库范围，不要编造答案。',
              '回答给企业微信群成员，语气自然、简洁。',
              '必须使用“结论 / 处理步骤 / 补充说明 / 参考来源”的结构。'
            ].filter(Boolean).join('\n\n')
          },
          {
            role: 'user',
            content: buildUserPrompt(question, context)
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const body = await safeReadText(response);
      throw new Error(`knowledge request failed: ${response.status} ${body}`.trim());
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) {
      throw new Error('knowledge response did not include an answer');
    }

    return answer;
  }
}

function buildUserPrompt(question, context) {
  const lines = [`用户问题：${question}`];

  if (context.sender) {
    lines.push(`提问人：${context.sender}`);
  }

  if (context.roomId) {
    lines.push(`群聊ID：${context.roomId}`);
  }

  if (context.answerPlan) {
    lines.push('', context.answerPlan);
  }

  return lines.join('\n');
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
