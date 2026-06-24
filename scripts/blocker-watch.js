#!/usr/bin/env node
import 'dotenv/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBlockerReport } from '../src/blockerReport.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = join(__dirname, '..');
const statePath = join(projectDir, '.runtime', 'blocker-watch.json');

const report = buildBlockerReport();
const previous = await readState();

if (report.hasBlockers && report.fingerprint !== previous.fingerprint) {
  await writeState({ fingerprint: report.fingerprint, lastChangedAt: report.generatedAt });
  console.log(report.message);
} else if (!report.hasBlockers && previous.fingerprint) {
  await writeState({ fingerprint: '', lastChangedAt: report.generatedAt });
  console.log('黑卫士七维AI营销系统的关键阻塞已解除。全平台接入路线和核心模块目前没有新的卡点，可以继续推进真实联调。');
}

async function readState() {
  try {
    return JSON.parse(await readFile(statePath, 'utf8'));
  } catch {
    return { fingerprint: '', lastChangedAt: null };
  }
}

async function writeState(nextState) {
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');
}
