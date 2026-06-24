export function formatReply(answer, maxChars = 900) {
  const text = String(answer || '').trim();
  const fallback = '我暂时没有在知识库里找到可靠答案，建议转人工确认。';
  const normalized = text || fallback;

  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxChars - 16)).trim()}...\n\n内容较长，已自动截断。`;
}
