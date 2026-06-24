export function extractQuestion(text, mentionName) {
  if (typeof text !== 'string') {
    return null;
  }

  const cleaned = normalizeText(text);
  if (!cleaned) {
    return null;
  }

  for (const pattern of mentionPatterns(mentionName)) {
    const match = cleaned.match(pattern);
    if (match) {
      const question = cleaned.slice(match[0].length).trim();
      return question || null;
    }
  }

  return null;
}

export function shouldReplyToMessage(message, mentionName) {
  const text = getMessageText(message);
  const question = extractQuestion(text, mentionName);
  return question ? { shouldReply: true, question } : { shouldReply: false, question: null };
}

export function getMessageText(message) {
  if (!message || typeof message !== 'object') {
    return '';
  }

  return (
    message.text?.content ||
    message.content ||
    message.messageContent ||
    message.payload?.text?.content ||
    ''
  );
}

function normalizeText(text) {
  return text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function mentionPatterns(mentionName) {
  const escaped = escapeRegExp(mentionName.trim());
  return [
    new RegExp(`^@${escaped}(?:\\s+|[:：,，])?`, 'i'),
    new RegExp(`^${escaped}(?:\\s+|[:：,，])`, 'i')
  ];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
