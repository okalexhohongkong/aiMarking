import 'dotenv/config';
import { createSystem } from './bootstrap.js';
import { readConfigSummary } from './config.js';

async function main() {
  const system = await createSystem({ startBot: false, startAdmin: true });
  const { host, port } = system.config.admin;

  system.adminServer.listen(port, host, () => {
    const summary = readConfigSummary();
    console.log(`管理后台已启动：http://${host}:${port}`);
    console.log(`机器人名称：@${summary.botMentionName}`);
  });
}

main().catch((error) => {
  console.error('管理后台启动失败：', {
    name: error?.name,
    message: error?.message
  });
  process.exitCode = 1;
});
