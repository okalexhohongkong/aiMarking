import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDataWarehouseBlueprint } from '../src/dataWarehouseBlueprint.js';

test('builds a safe nightly data warehouse blueprint', () => {
  const blueprint = buildDataWarehouseBlueprint({
    localStatus: {
      latestBackup: { name: 'backup-20260628-100000-dashboard' },
      counts: {
        knowledge: 12,
        conversations: 7,
        growthLeads: 3,
        privateMessageApprovals: 2,
        hermesCommands: 1
      },
      files: [{ name: 'knowledge.json', exists: true }],
      admin: { httpOk: true, processAlive: true }
    },
    now: new Date('2026-06-29T00:30:00.000Z')
  });

  assert.equal(blueprint.name, '数据建仓与仓库权限中心');
  assert.equal(blueprint.safeMode, true);
  assert.equal(blueprint.sideEffectsEnabled, false);
  assert.equal(blueprint.schedule.window, '每天 00:00-02:00');
  assert.equal(blueprint.schedule.autoBuildEnabled, true);
  assert.equal(blueprint.summary.status, 'ready_for_nightly_build');
  assert.ok(blueprint.warehouseLayers.some((layer) => layer.id === 'knowledge-graph'));
  assert.ok(blueprint.warehouseLayers.some((layer) => layer.id === 'lead-conversion'));
  assert.ok(blueprint.actions.some((action) => action.id === 'nightly-build'));
  assert.ok(blueprint.permissionPolicy.ownerConsentRequired);
  assert.ok(blueprint.permissionPolicy.passphraseRequired);
  assert.equal(blueprint.permissionPolicy.requiredApprovals, 3);
  assert.ok(blueprint.permissionPolicy.blockedWithoutOwner.includes('共享'));
  assert.ok(blueprint.guardrails.some((rule) => rule.includes('口令')));
});

test('blocks warehouse sharing and closeout when backup or runtime is missing', () => {
  const blueprint = buildDataWarehouseBlueprint({
    localStatus: {
      latestBackup: null,
      counts: {},
      files: [{ name: 'knowledge.json', exists: false }],
      admin: { httpOk: false, processAlive: false }
    }
  });

  assert.equal(blueprint.summary.status, 'blocked_until_safe');
  assert.equal(blueprint.actions.every((action) => action.mode.includes('preview')), true);
  assert.ok(blueprint.blockers.some((blocker) => blocker.title.includes('备份')));
  assert.ok(blueprint.blockers.some((blocker) => blocker.title.includes('后台')));
  assert.ok(blueprint.blockers.some((blocker) => blocker.title.includes('数据文件')));
});
