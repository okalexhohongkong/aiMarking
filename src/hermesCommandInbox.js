export function buildHermesCommandPayload({
  text,
  sender = 'apple',
  source = 'hermes',
  priority = 'normal',
  direction = 'inbound',
  type = 'task',
  target = 'codex',
  moduleId = '',
  taskId = ''
} = {}) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) {
    throw new Error('Hermes 指令内容不能为空。');
  }
  if (normalizedText.length > 3000) {
    throw new Error('Hermes 指令内容太长，最多 3000 字。');
  }

  const payload = {
    source: normalizeText(source) || 'hermes',
    sender: normalizeText(sender) || 'apple',
    priority: normalizePriority(priority),
    direction: normalizeDirection(direction),
    type: normalizeCommandType(type),
    target: normalizeText(target) || 'codex',
    text: normalizedText
  };

  const normalizedModuleId = normalizeText(moduleId);
  const normalizedTaskId = normalizeText(taskId);
  if (normalizedModuleId) {
    payload.moduleId = normalizedModuleId;
  }
  if (normalizedTaskId) {
    payload.taskId = normalizedTaskId;
  }

  return payload;
}

export async function submitHermesCommand({
  baseUrl = 'http://127.0.0.1:8787',
  command,
  fetchImpl = globalThis.fetch
} = {}) {
  const payload = buildHermesCommandPayload(command);
  const response = await fetchImpl(`${baseUrl.replace(/\/+$/, '')}/api/hermes/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || 'Hermes 指令入箱失败。');
  }

  return data;
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizePriority(value) {
  const normalized = normalizeText(value);
  return ['normal', 'high'].includes(normalized) ? normalized : 'normal';
}

function normalizeDirection(value) {
  const normalized = normalizeText(value);
  return ['inbound', 'outbound'].includes(normalized) ? normalized : 'inbound';
}

function normalizeCommandType(value) {
  const normalized = normalizeText(value);
  return ['task', 'blocker', 'progress', 'split', 'merge'].includes(normalized) ? normalized : 'task';
}
