import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { LocalOperations } from '../src/localOperations.js';

test('reports local data status counts', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-local-ops-'));
  try {
    await seedLocalData(dir);
    const ops = new LocalOperations({ projectDir: dir });

    const status = await ops.getDataStatus();

    assert.equal(status.counts.knowledge, 2);
    assert.equal(status.counts.conversations, 1);
    assert.equal(status.counts.growthLeads, 1);
    assert.equal(status.counts.hermesCommands, 1);
    assert.equal(status.counts.privateMessageApprovals, 1);
    assert.equal(status.files.every((file) => file.exists), true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('creates a local backup and restores the latest backup', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-local-ops-'));
  try {
    await seedLocalData(dir);
    const ops = new LocalOperations({
      projectDir: dir,
      now: () => new Date(2026, 5, 21, 21, 45, 0)
    });

    const backup = await ops.createBackup({ label: 'manual' });
    assert.match(backup.name, /^backup-20260621-214500-manual$/);
    assert.equal(backup.files.length, 5);

    await writeFile(join(dir, 'data', 'knowledge.json'), '[]\n', 'utf8');
    assert.equal(JSON.parse(await readFile(join(dir, 'data', 'knowledge.json'), 'utf8')).length, 0);

    const restored = await ops.restoreBackup();
    const knowledge = JSON.parse(await readFile(join(dir, 'data', 'knowledge.json'), 'utf8'));

    assert.equal(restored.restoredFiles.length, 5);
    assert.equal(knowledge.length, 2);
    assert.ok(restored.safetyBackup.name.includes('before-restore'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('imports knowledge items and skips duplicates', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-local-ops-'));
  try {
    await seedLocalData(dir);
    const importPath = join(dir, 'incoming-knowledge.json');
    await writeFile(
      importPath,
      JSON.stringify(
        {
          items: [
            {
              title: '合同签署资料',
              content: '合同需要营业执照、联系人和开票资料。'
            },
            {
              title: '新客户到店流程',
              content: '先确认需求，再安排顾问接待。',
              tags: '到店,新客户',
              steps: '确认需求\n安排顾问'
            }
          ]
        },
        null,
        2
      ),
      'utf8'
    );

    const ops = new LocalOperations({ projectDir: dir });
    const result = await ops.importKnowledge(importPath);
    const knowledge = JSON.parse(await readFile(join(dir, 'data', 'knowledge.json'), 'utf8'));
    const imported = knowledge.find((item) => item.title === '新客户到店流程');

    assert.equal(result.importedCount, 1);
    assert.equal(result.skippedCount, 1);
    assert.equal(knowledge.length, 3);
    assert.deepEqual(imported.tags, ['到店', '新客户']);
    assert.deepEqual(imported.steps, ['确认需求', '安排顾问']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('exports knowledge to a reviewable file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-local-ops-'));
  try {
    await seedLocalData(dir);
    const ops = new LocalOperations({
      projectDir: dir,
      now: () => new Date(2026, 5, 21, 22, 0, 0)
    });

    const exported = await ops.exportKnowledge();
    const payload = JSON.parse(await readFile(exported.path, 'utf8'));

    assert.equal(exported.itemCount, 2);
    assert.equal(payload.items.length, 2);
    assert.equal(payload.exportedAt, '2026-06-21T14:00:00.000Z');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('exports a knowledge import template for operators', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'wecom-local-ops-'));
  try {
    await seedLocalData(dir);
    const ops = new LocalOperations({
      projectDir: dir,
      now: () => new Date(2026, 5, 21, 22, 30, 0)
    });

    const exported = await ops.exportKnowledgeTemplate();
    const payload = JSON.parse(await readFile(exported.path, 'utf8'));

    assert.match(exported.name, /^knowledge-import-template-20260621-223000/);
    assert.equal(exported.itemCount, 2);
    assert.equal(payload.items.length, 2);
    assert.ok(payload.items.every((item) => item.title && item.content));
    assert.ok(payload.instructions.some((item) => item.includes('title')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

async function seedLocalData(projectDir) {
  await mkdir(join(projectDir, 'data'), { recursive: true });
  await writeJson(join(projectDir, 'data', 'knowledge.json'), [
    {
      id: 'k-contract',
      title: '合同签署资料',
      content: '合同需要营业执照、联系人和开票资料。',
      tags: ['合同'],
      category: '合同',
      scenarios: ['签约'],
      concepts: ['合同'],
      steps: ['收集资料'],
      createdAt: '2026-06-21T00:00:00.000Z',
      updatedAt: '2026-06-21T00:00:00.000Z'
    },
    {
      id: 'k-after-sale',
      title: '售后处理流程',
      content: '先确认问题，再安排处理。',
      tags: ['售后'],
      category: '售后',
      scenarios: [],
      concepts: [],
      steps: [],
      createdAt: '2026-06-21T00:00:00.000Z',
      updatedAt: '2026-06-21T00:00:00.000Z'
    }
  ]);
  await writeJson(join(projectDir, 'data', 'growth.json'), {
    scripts: [],
    materials: [],
    rules: [],
    leads: [{ id: 'lead-1', message: '多少钱' }]
  });
  await writeJson(join(projectDir, 'data', 'conversations.json'), [{ id: 'log-1', question: '合同怎么签' }]);
  await writeJson(join(projectDir, 'data', 'hermesCommands.json'), [{ id: 'cmd-1', text: '继续开发', status: 'new' }]);
  await writeJson(join(projectDir, 'data', 'privateMessageApprovals.json'), [
    { id: 'approval-1', message: '请人工确认后再发送', status: 'pending' }
  ]);
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'w' });
}
