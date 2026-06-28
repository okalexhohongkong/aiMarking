import assert from 'node:assert/strict';
import test from 'node:test';
import { buildResilienceBackupBlueprint } from '../src/resilienceBackupBlueprint.js';

test('builds a system-wide resilience and backup blueprint', () => {
  const blueprint = buildResilienceBackupBlueprint({
    localStatus: {
      projectDir: '/Users/apple/Documents/企业微信 智能客服',
      dataDir: '/Users/apple/Documents/企业微信 智能客服/data',
      latestBackup: { name: 'backup-20260628-100000-dashboard', path: '/tmp/backup' },
      counts: {
        knowledge: 12,
        conversations: 5,
        growthLeads: 3,
        hermesCommands: 2,
        privateMessageApprovals: 1
      },
      files: [
        { name: 'knowledge.json', exists: true },
        { name: 'growth.json', exists: true }
      ],
      admin: { httpOk: true, processAlive: true }
    }
  });

  assert.equal(blueprint.name, '容灾备份中心');
  assert.equal(blueprint.safeMode, true);
  assert.equal(blueprint.sideEffectsEnabled, false);
  assert.ok(blueprint.systems.some((system) => system.id === 'knowledge'));
  assert.ok(blueprint.systems.some((system) => system.id === 'agent'));
  assert.ok(blueprint.actions.some((action) => action.id === 'manual-backup'));
  assert.ok(blueprint.actions.some((action) => action.id === 'restore-rehearsal'));
  assert.ok(blueprint.backupTypes.some((type) => type.id === 'time-capsule'));
  assert.ok(blueprint.backupTypes.some((type) => type.id === 'full-database'));
  assert.ok(blueprint.backupTypes.some((type) => type.id === 'organization-structure'));
  assert.ok(blueprint.backupTypes.some((type) => type.id === 'node-protocol-port'));
  assert.ok(blueprint.backupTypes.some((type) => type.id === 'clone-machine'));
  assert.equal(blueprint.approvalPolicy.level, '最高权限');
  assert.equal(blueprint.approvalPolicy.requiredApprovals, 3);
  assert.ok(blueprint.approvalPolicy.approvers.every((approver) => approver.level === '最高'));
  assert.ok(blueprint.retentionPolicy.includes('本机'));
  assert.ok(blueprint.auditRules.some((rule) => rule.includes('恢复前')));
  assert.equal(blueprint.summary.latestBackupName, 'backup-20260628-100000-dashboard');
});

test('marks missing backup and offline runtime as blockers', () => {
  const blueprint = buildResilienceBackupBlueprint({
    localStatus: {
      latestBackup: null,
      counts: {},
      files: [{ name: 'knowledge.json', exists: false }],
      admin: { httpOk: false, processAlive: false }
    }
  });

  assert.equal(blueprint.summary.status, 'needs_backup');
  assert.ok(blueprint.blockers.some((blocker) => blocker.title.includes('还没有备份')));
  assert.ok(blueprint.blockers.some((blocker) => blocker.title.includes('后台未在线')));
  assert.ok(blueprint.blockers.some((blocker) => blocker.title.includes('数据文件缺失')));
});
