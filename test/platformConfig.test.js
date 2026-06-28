import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildPlatformConfigStatus, savePlatformConfig } from '../src/platformConfig.js';

test('builds platform config status from env file without exposing values', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-platform-config-'));
  const envPath = join(dir, '.env');
  await writeFile(envPath, 'WECOM_BOT_ID="bot-file"\nWECOM_BOT_SECRET="secret-file"\nOPENAI_API_KEY="key-file"\n', 'utf8');

  try {
    const status = await buildPlatformConfigStatus({
      env: {
        WECOM_BOT_ID: '',
        WECOM_BOT_SECRET: '',
        OPENAI_API_KEY: '',
        OPENAI_BASE_URL: 'http://127.0.0.1:3688/v1',
        OPENAI_MODEL: 'gpt-4.1-mini',
        KNOWLEDGE_BASE_NAME: '奥普C在知识库',
        BOT_MENTION_NAME: '智能客服'
      },
      envPath
    });
    const serialized = JSON.stringify(status);
    const wecom = status.sections.find((section) => section.id === 'wecom');

    assert.equal(wecom.missingRequired.length, 0);
    assert.equal(status.summary.readySections >= 2, true);
    assert.equal(serialized.includes('secret-file'), false);
    assert.equal(serialized.includes('bot-file'), false);
    assert.equal(serialized.includes('key-file'), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('saves allowlisted platform config values only', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-platform-config-'));
  const envPath = join(dir, '.env');

  try {
    const result = await savePlatformConfig({
      sectionId: 'douyin',
      values: {
        DOUYIN_APP_ID: 'douyin-app',
        DOUYIN_APP_SECRET: 'douyin-secret'
      },
      env: {},
      envPath
    });
    const serialized = JSON.stringify(result);
    const content = await readFile(envPath, 'utf8');

    assert.equal(result.savedKeys.length, 2);
    assert.equal(serialized.includes('douyin-secret'), false);
    assert.equal(serialized.includes('douyin-app'), false);
    assert.match(content, /DOUYIN_APP_ID="douyin-app"/);
    assert.match(content, /DOUYIN_APP_SECRET="douyin-secret"/);
    assert.rejects(
      savePlatformConfig({
        sectionId: 'douyin',
        values: { NOT_ALLOWED: 'x' },
        env: {},
        envPath
      }),
      /不允许/
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('includes AI call, Yunke, and CRM business config sections', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-platform-config-'));
  const envPath = join(dir, '.env');

  try {
    const status = await buildPlatformConfigStatus({ env: {}, envPath });
    const ids = status.sections.map((section) => section.id);

    assert.ok(ids.includes('ai-call'));
    assert.ok(ids.includes('yunke-call-import'));
    assert.ok(ids.includes('crm-import'));
    assert.ok(status.sections.find((section) => section.id === 'ai-call').fields.some((field) => field.key === 'CALL_API_KEY'));
    assert.ok(status.sections.find((section) => section.id === 'yunke-call-import').fields.some((field) => field.key === 'YUNKE_API_TOKEN'));
    assert.ok(status.sections.find((section) => section.id === 'crm-import').fields.some((field) => field.key === 'CRM_API_TOKEN'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('includes preferred and custom agent config sections without exposing values', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-platform-config-'));
  const envPath = join(dir, '.env');
  await writeFile(
    envPath,
    [
      'OPEN_CLOUD_AGENT_BASE_URL="https://agent.example.test"',
      'OPEN_CLOUD_AGENT_TOKEN="open-cloud-secret"',
      'HERMES_AGENT_WEBHOOK_URL="https://hermes.example.test/hook"',
      'HERMES_AGENT_TOKEN="hermes-secret"',
      'CUSTOM_AGENT_NAME="销售复盘Agent"',
      'CUSTOM_AGENT_BASE_URL="https://custom.example.test"',
      'CUSTOM_AGENT_TOKEN="custom-secret"'
    ].join('\n'),
    'utf8'
  );

  try {
    const status = await buildPlatformConfigStatus({ env: {}, envPath });
    const ids = status.sections.map((section) => section.id);
    const serialized = JSON.stringify(status);

    assert.ok(ids.includes('open-cloud-agent'));
    assert.ok(ids.includes('hermes-agent'));
    assert.ok(ids.includes('custom-agent'));
    assert.equal(status.sections.find((section) => section.id === 'open-cloud-agent').missingRequired.length, 0);
    assert.equal(status.sections.find((section) => section.id === 'hermes-agent').missingRequired.length, 0);
    assert.equal(status.sections.find((section) => section.id === 'custom-agent').missingRequired.length, 0);
    assert.equal(serialized.includes('open-cloud-secret'), false);
    assert.equal(serialized.includes('hermes-secret'), false);
    assert.equal(serialized.includes('custom-secret'), false);
    assert.equal(serialized.includes('https://agent.example.test'), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('builds user-facing material checklist without raw env names in next steps', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-platform-config-'));
  const envPath = join(dir, '.env');

  try {
    const status = await buildPlatformConfigStatus({ env: {}, envPath });
    const wecom = status.sections.find((section) => section.id === 'wecom');
    const aiCall = status.sections.find((section) => section.id === 'ai-call');
    const serializedMaterials = JSON.stringify([wecom.missingMaterials, aiCall.missingMaterials, wecom.nextStep, aiCall.nextStep]);

    assert.ok(wecom.missingMaterials.some((item) => item.label === '企业微信机器人 ID'));
    assert.ok(aiCall.missingMaterials.some((item) => item.label === '呼叫平台名称'));
    assert.match(wecom.nextStep, /企业微信机器人 ID/);
    assert.match(aiCall.nextStep, /呼叫平台名称/);
    assert.equal(serializedMaterials.includes('WECOM_BOT_ID'), false);
    assert.equal(serializedMaterials.includes('CALL_API_KEY'), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('saves CRM business config without returning secret values', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-platform-config-'));
  const envPath = join(dir, '.env');

  try {
    const result = await savePlatformConfig({
      sectionId: 'crm-import',
      values: {
        CRM_API_BASE_URL: 'https://crm.example.test',
        CRM_API_TOKEN: 'crm-secret-token'
      },
      env: {},
      envPath
    });
    const serialized = JSON.stringify(result);
    const content = await readFile(envPath, 'utf8');

    assert.equal(result.savedKeys.length, 2);
    assert.equal(serialized.includes('crm-secret-token'), false);
    assert.equal(serialized.includes('https://crm.example.test'), false);
    assert.match(content, /CRM_API_BASE_URL="https:\/\/crm\.example\.test"/);
    assert.match(content, /CRM_API_TOKEN="crm-secret-token"/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
