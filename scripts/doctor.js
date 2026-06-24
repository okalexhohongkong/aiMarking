import 'dotenv/config';

const required = [
  ['WECOM_BOT_ID', '企业微信智能机器人 ID'],
  ['WECOM_BOT_SECRET', '企业微信智能机器人 Secret'],
  ['OPENAI_API_KEY', 'CCX/OpenAI 兼容接口访问密钥']
];

const missing = required.filter(([name]) => !process.env[name]?.trim());
const baseUrl = trimTrailingSlash(process.env.OPENAI_BASE_URL || 'http://127.0.0.1:3688/v1');

console.log('黑卫士七维AI营销系统配置检查');
console.log(`- 知识库接口: ${baseUrl}`);
console.log(`- 机器人触发名: ${process.env.BOT_MENTION_NAME || '智能客服'}`);
console.log(`- 知识库名称: ${process.env.KNOWLEDGE_BASE_NAME || '奥普C在知识库'}`);

if (missing.length) {
  console.log('\n还缺这些配置：');
  for (const [name, label] of missing) {
    console.log(`- ${name}: ${label}`);
  }
} else {
  console.log('\n基础配置已填写。');
}

await checkKnowledgeEndpoint(baseUrl, process.env.OPENAI_API_KEY);

if (missing.length) {
  process.exitCode = 1;
}

async function checkKnowledgeEndpoint(baseUrl, apiKey) {
  if (!apiKey?.trim()) {
    console.log('\n跳过知识库连通性检查：OPENAI_API_KEY 未填写。');
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey.trim()}` }
    });

    if (response.ok) {
      console.log('知识库接口连通性：正常。');
      return;
    }

    console.log(`知识库接口连通性：返回 HTTP ${response.status}，请检查密钥或接口地址。`);
  } catch (error) {
    console.log(`知识库接口连通性：无法连接，${error.message}`);
  }
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}
