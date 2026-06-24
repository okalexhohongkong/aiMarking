import 'dotenv/config';
import { createSystem } from './bootstrap.js';

async function main() {
  const system = await createSystem({ startBot: true, startAdmin: true });
  const { host, port } = system.config.admin;

  system.adminServer.listen(port, host, async () => {
    console.log(`黑卫士七维AI营销系统后台已启动：http://${host}:${port}`);
    await system.botService.start();
    console.log(`企业微信入口已启动，群里 @${system.config.bot.mentionName} 即可调用知识库。`);
  });
}

main().catch((error) => {
  console.error('黑卫士七维AI营销系统启动失败：', {
    name: error?.name,
    message: error?.message
  });
  process.exitCode = 1;
});
