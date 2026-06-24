#!/usr/bin/env node
import 'dotenv/config';
import { submitHermesCommand } from '../src/hermesCommandInbox.js';

const args = process.argv.slice(2);
const text = args.join(' ') || (await readStdin());

try {
  const result = await submitHermesCommand({
    baseUrl: process.env.ADMIN_BASE_URL || 'http://127.0.0.1:8787',
    command: {
      text,
      source: process.env.HERMES_COMMAND_SOURCE || 'hermes',
      sender: process.env.HERMES_COMMAND_SENDER || 'apple',
      priority: process.env.HERMES_COMMAND_PRIORITY || 'normal'
    }
  });

  console.log(`Hermes 指令已进入收件箱：${result.id}`);
  console.log('状态：待确认，不会自动执行。');
} catch (error) {
  console.error(`Hermes 指令入箱失败：${error.message}`);
  process.exitCode = 1;
}

async function readStdin() {
  if (process.stdin.isTTY) {
    return '';
  }

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}
