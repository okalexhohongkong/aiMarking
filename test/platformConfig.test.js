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
