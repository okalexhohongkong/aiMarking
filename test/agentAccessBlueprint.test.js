import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAgentAccessBlueprint } from '../src/agentAccessBlueprint.js';

test('builds preferred and custom agent access blueprint without leaking secrets', () => {
  const blueprint = buildAgentAccessBlueprint({
    env: {
      OPEN_CLOUD_AGENT_BASE_URL: 'https://agent.example.test',
      OPEN_CLOUD_AGENT_TOKEN: 'open-cloud-secret',
      HERMES_AGENT_WEBHOOK_URL: 'https://hermes.example.test/hook',
      HERMES_AGENT_TOKEN: 'hermes-secret',
      CUSTOM_AGENT_NAME: '销售复盘Agent',
      CUSTOM_AGENT_BASE_URL: 'https://custom.example.test',
      CUSTOM_AGENT_TOKEN: 'custom-secret'
    }
  });
  const serialized = JSON.stringify(blueprint);

  assert.equal(blueprint.safeMode, true);
  assert.equal(blueprint.sideEffectsEnabled, false);
  assert.equal(blueprint.summary.totalAgents, 3);
  assert.ok(blueprint.agents.some((agent) => agent.id === 'open-cloud-agent'));
  assert.ok(blueprint.agents.some((agent) => agent.name === 'Hermes agent'));
  assert.ok(blueprint.agents.some((agent) => agent.name === '销售复盘Agent'));
  assert.ok(blueprint.agents.every((agent) => agent.mode === 'dry_run_preview'));
  assert.ok(blueprint.safetyRules.some((rule) => rule.includes('人工确认')));
  assert.ok(blueprint.safetyRules.some((rule) => rule.includes('密钥')));
  assert.equal(serialized.includes('open-cloud-secret'), false);
  assert.equal(serialized.includes('hermes-secret'), false);
  assert.equal(serialized.includes('custom-secret'), false);
  assert.equal(serialized.includes('https://agent.example.test'), false);
});

test('shows missing materials for agent access when credentials are absent', () => {
  const blueprint = buildAgentAccessBlueprint({ env: {} });
  const openCloud = blueprint.agents.find((agent) => agent.id === 'open-cloud-agent');
  const hermes = blueprint.agents.find((agent) => agent.id === 'hermes-agent');
  const custom = blueprint.agents.find((agent) => agent.id === 'custom-agent');

  assert.equal(openCloud.status, 'needs_credentials');
  assert.equal(hermes.status, 'needs_credentials');
  assert.equal(custom.status, 'optional');
  assert.ok(openCloud.missingMaterials.some((item) => item.label === 'Open cloud agent 地址'));
  assert.ok(hermes.missingMaterials.some((item) => item.label === 'Hermes agent Webhook'));
  assert.ok(custom.missingMaterials.some((item) => item.label === '自定义Agent名称'));
  assert.match(openCloud.nextStep, /Open cloud agent 地址/);
  assert.doesNotMatch(JSON.stringify(blueprint), /OPEN_CLOUD_AGENT_TOKEN|HERMES_AGENT_TOKEN|CUSTOM_AGENT_TOKEN/);
});
