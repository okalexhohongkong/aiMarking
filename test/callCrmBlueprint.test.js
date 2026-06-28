import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCallCrmBlueprint } from '../src/callCrmBlueprint.js';

test('builds safe AI call, Yunke import, and CRM import blueprint', () => {
  const blueprint = buildCallCrmBlueprint({
    now: new Date('2026-06-27T08:00:00.000Z'),
    env: {}
  });

  assert.equal(blueprint.safeMode, true);
  assert.equal(blueprint.sideEffectsEnabled, false);
  assert.equal(blueprint.modules.length, 3);
  assert.deepEqual(
    blueprint.modules.map((module) => module.id),
    ['ai-call', 'yunke-call-import', 'crm-import']
  );
  assert.ok(blueprint.modules.every((module) => module.actionMode === 'read_only_blueprint'));
  assert.ok(blueprint.modules.every((module) => module.safetyRules.some((rule) => rule.includes('不') || rule.includes('必须'))));
  assert.ok(blueprint.modules.every((module) => module.fieldMappings.length >= module.inputFields.length));
  assert.ok(blueprint.modules.every((module) => module.fieldMappings.some((field) => field.required)));
  assert.ok(blueprint.modules.every((module) => module.fieldMappings.every((field) => field.source && field.target && field.rule)));
  assert.ok(blueprint.modules.every((module) => module.preview?.mode === 'preview_only'));
  assert.ok(blueprint.modules.every((module) => module.preview.sideEffectsEnabled === false));
  assert.ok(blueprint.modules.every((module) => module.preview.rows.length > 0));
  assert.ok(blueprint.modules.every((module) => module.preview.reviewChecklist.some((item) => item.includes('人工'))));
  assert.ok(blueprint.modules.every((module) => module.preview.exceptionFilters.length > 0));
  assert.ok(blueprint.modules.every((module) => module.preview.reviewQueue.length > 0));
  assert.ok(blueprint.modules.every((module) => module.preview.sandboxValidation?.mode === 'dry_run'));
  assert.ok(blueprint.modules.every((module) => module.preview.sandboxValidation.sideEffectsEnabled === false));
  assert.ok(blueprint.modules.every((module) => module.preview.sandboxValidation.checks.length > 0));
});

test('marks sandbox readiness without leaking credential values', () => {
  const blueprint = buildCallCrmBlueprint({
    env: {
      CALL_PROVIDER: 'demo-call',
      CALL_API_BASE_URL: 'https://call.example.test',
      CALL_API_KEY: 'call-secret-value',
      YUNKE_API_BASE_URL: 'https://yunke.example.test',
      YUNKE_API_TOKEN: 'yunke-secret-value',
      CRM_API_BASE_URL: 'https://crm.example.test',
      CRM_API_TOKEN: 'crm-secret-value'
    }
  });
  const serialized = JSON.stringify(blueprint);

  assert.equal(blueprint.summary.ready, 3);
  assert.ok(blueprint.modules.every((module) => module.status === 'ready_for_sandbox'));
  assert.equal(serialized.includes('call-secret-value'), false);
  assert.equal(serialized.includes('yunke-secret-value'), false);
  assert.equal(serialized.includes('crm-secret-value'), false);
  assert.equal(serialized.includes('fieldMappings'), true);
});

test('keeps call, Yunke, and CRM previews masked and side-effect free', () => {
  const blueprint = buildCallCrmBlueprint({
    now: new Date('2026-06-28T08:00:00.000Z'),
    env: {}
  });

  const previews = blueprint.modules.map((module) => module.preview);
  assert.deepEqual(
    previews.map((preview) => preview.title),
    ['外呼任务预览', '云客导入批次预览', 'CRM同步预览']
  );
  assert.ok(previews.every((preview) => preview.rows.every((row) => String(row.maskedPhone || '').includes('****'))));
  assert.ok(previews.every((preview) => preview.rows.every((row) => !/1[3-9]\d{9}/.test(JSON.stringify(row)))));
  assert.ok(previews.every((preview) => preview.rows.every((row) => row.action && row.status)));
  assert.equal(JSON.stringify(previews).includes('真实拨号'), false);
});

test('adds consent, frequency, exception filters, and human review queue', () => {
  const blueprint = buildCallCrmBlueprint({
    now: new Date('2026-06-28T12:00:00.000Z'),
    env: {}
  });
  const moduleById = new Map(blueprint.modules.map((module) => [module.id, module]));
  const aiCall = moduleById.get('ai-call');
  const yunke = moduleById.get('yunke-call-import');
  const crm = moduleById.get('crm-import');

  assert.ok(aiCall.preview.authorizationChecks.some((item) => item.id === 'consent-source'));
  assert.ok(aiCall.preview.frequencyRules.some((item) => item.id === 'daily-call-cap'));
  assert.ok(aiCall.preview.frequencyRules.every((item) => item.enforcement === 'preview_block'));
  assert.ok(yunke.preview.exceptionFilters.some((item) => item.id === 'duplicate-phone'));
  assert.ok(crm.preview.exceptionFilters.some((item) => item.id === 'missing-consent'));
  assert.ok(blueprint.modules.every((module) => module.preview.reviewQueue.every((item) => item.reason && item.action && item.severity)));
  assert.ok(blueprint.modules.every((module) => module.preview.reviewQueue.every((item) => !/1[3-9]\d{9}/.test(JSON.stringify(item)))));
});

test('adds sandbox validation results without enabling external actions', () => {
  const blueprint = buildCallCrmBlueprint({
    now: new Date('2026-06-28T16:00:00.000Z'),
    env: {}
  });
  const validations = blueprint.modules.map((module) => module.preview.sandboxValidation);

  assert.deepEqual(
    validations.map((validation) => validation.title),
    ['AI呼叫沙盒任务队列校验', '云客沙盒导入校验', 'CRM沙盒同步校验']
  );
  assert.ok(validations.every((validation) => validation.auditId.startsWith('dry-run-')));
  assert.ok(validations.every((validation) => validation.sideEffectsEnabled === false));
  assert.ok(validations.every((validation) => validation.checks.every((check) => check.name && check.status && check.result)));
  assert.ok(validations.every((validation) => validation.blockers.every((blocker) => blocker.reason && blocker.nextStep)));
  assert.equal(JSON.stringify(validations).includes('CALL_API_KEY'), false);
  assert.equal(JSON.stringify(validations).includes('YUNKE_API_TOKEN'), false);
  assert.equal(JSON.stringify(validations).includes('CRM_API_TOKEN'), false);
  assert.equal(JSON.stringify(validations).includes('真实写入'), false);
});

test('adds import templates and Chinese credential blockers for call, Yunke, and CRM', () => {
  const blueprint = buildCallCrmBlueprint({
    now: new Date('2026-06-28T20:00:00.000Z'),
    env: {}
  });
  const moduleById = new Map(blueprint.modules.map((module) => [module.id, module]));
  const aiCall = moduleById.get('ai-call');
  const yunke = moduleById.get('yunke-call-import');
  const crm = moduleById.get('crm-import');
  const serialized = JSON.stringify(blueprint);

  assert.ok(aiCall.credentialBlockers.some((item) => item.label === '呼叫平台名称'));
  assert.ok(yunke.credentialBlockers.some((item) => item.label === '云客 API 地址'));
  assert.ok(crm.credentialBlockers.some((item) => item.label === 'CRM API 地址'));
  assert.ok(yunke.importTemplate.fields.some((field) => field.name === '通话结果' && field.required));
  assert.ok(crm.importTemplate.fields.some((field) => field.name === '客户阶段' && field.required));
  assert.ok(blueprint.modules.every((module) => module.importTemplate.safetyNotes.some((note) => note.includes('脱敏'))));
  assert.equal(serialized.includes('CALL_API_KEY'), false);
  assert.equal(serialized.includes('YUNKE_API_TOKEN'), false);
  assert.equal(serialized.includes('CRM_API_TOKEN'), false);
});
