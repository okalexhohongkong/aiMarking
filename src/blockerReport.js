import { buildIntegrationRoadmap } from './integrationRoadmap.js';
import { buildProjectProgress } from './projectProgress.js';

export function buildBlockerReport({ env = process.env, now = new Date() } = {}) {
  const roadmap = buildIntegrationRoadmap({ env, now });
  const progress = buildProjectProgress({ env, now });
  const integrationBlockers = roadmap.steps
    .filter((step) => step.status === 'blocked' || step.missingRequired.length)
    .map((step) => ({
      type: 'platform',
      id: step.id,
      name: step.name,
      status: step.status,
      statusLabel: step.statusLabel,
      percentText: step.percentText,
      countdownText: step.countdownText,
      missingRequired: step.missingRequired,
      nextStep: step.nextStep
    }));
  const moduleBlockers = progress.modules
    .filter((module) => module.tone === 'paused')
    .map((module) => ({
      type: 'module',
      id: module.id,
      name: module.title,
      status: module.tone,
      statusLabel: module.colorLabel,
      percentText: module.percentText,
      countdownText: module.countdownText,
      missingRequired: [],
      nextStep: module.nextStep
    }));
  const blockers = dedupeBlockers([...integrationBlockers, ...moduleBlockers]);

  return {
    generatedAt: now.toISOString(),
    hasBlockers: blockers.length > 0,
    fingerprint: buildFingerprint(blockers),
    message: blockers.length ? formatBlockerMessage(blockers, now) : '',
    blockers,
    summary: {
      total: blockers.length,
      platform: blockers.filter((blocker) => blocker.type === 'platform').length,
      module: blockers.filter((blocker) => blocker.type === 'module').length
    }
  };
}

function buildFingerprint(blockers) {
  return blockers
    .map((blocker) => `${blocker.type}:${blocker.id}:${blocker.status}:${blocker.missingRequired.join(',')}`)
    .join('|');
}

function formatBlockerMessage(blockers, now) {
  return [
    '黑卫士七维AI营销系统出现需要处理的真实阻塞。',
    `检查时间：${formatLocalTime(now)}`,
    `范围：全平台接入路线和核心模块进度`,
    '',
    ...blockers.flatMap((blocker, index) => [
      `${index + 1}. ${blocker.name}：${blocker.statusLabel}，进度 ${blocker.percentText}，剩余 ${blocker.countdownText}`,
      `类型：${blocker.type === 'platform' ? '平台接入' : '系统模块'}`,
      `缺少资料：${blocker.missingRequired.join('、') || '暂无明确资料缺口'}`,
      `下一步：${blocker.nextStep}`
    ]),
    '',
    '我会继续推进不依赖这些资料的模块；这些资料补齐后即可进入真实联调。'
  ].join('\n');
}

function dedupeBlockers(blockers) {
  const seen = new Set();
  return blockers.filter((blocker) => {
    const key = `${blocker.type}:${blocker.id}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function formatLocalTime(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}
