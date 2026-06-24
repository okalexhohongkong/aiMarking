const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const productName = '黑卫士七维AI营销系统';
let mainWindow;
let adminServer;
let adminUrl = '';

function log(message) {
  try {
    const logPath = path.join(app.getPath('userData'), 'desktop.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
  } catch {
    // Logging must never stop the app from opening.
  }
}

async function findAvailablePort(preferredPort) {
  for (let port = preferredPort; port < preferredPort + 30; port += 1) {
    if (await canListen(port)) {
      return port;
    }
  }
  return 0;
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function listen(server, host, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolve(server.address());
    });
  });
}

async function startAdmin() {
  const userDataDir = app.getPath('userData');
  const dataDir = path.join(userDataDir, 'data');
  const preferredPort = Number.parseInt(process.env.ADMIN_PORT || '8787', 10) || 8787;
  const port = await findAvailablePort(preferredPort);

  process.env.DATA_DIR = process.env.DATA_DIR || dataDir;
  process.env.PLATFORM_CONFIG_ENV_PATH = process.env.PLATFORM_CONFIG_ENV_PATH || path.join(userDataDir, '.env');
  process.env.ADMIN_HOST = '127.0.0.1';
  process.env.ADMIN_PORT = String(port);
  process.env.BOT_MENTION_NAME = process.env.BOT_MENTION_NAME || '智能客服';
  process.env.KNOWLEDGE_BASE_NAME = process.env.KNOWLEDGE_BASE_NAME || '奥普C在知识库';

  const bootstrapPath = path.join(app.getAppPath(), 'src', 'bootstrap.js');
  const { createSystem } = await import(pathToFileURL(bootstrapPath).href);
  const system = await createSystem({ startBot: false, startAdmin: true, env: process.env });
  const address = await listen(system.adminServer, system.config.admin.host, system.config.admin.port);

  adminServer = system.adminServer;
  adminUrl = `http://${system.config.admin.host}:${address.port}`;
  log(`Admin started at ${adminUrl}; data dir: ${dataDir}`);
  return adminUrl;
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    title: productName,
    backgroundColor: '#f5f7f8',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(url);
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: 'deny' };
  });
}

function installMenu() {
  const template = [
    {
      label: productName,
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: productName,
              message: `${productName} 1.0`,
              detail: `本机后台：${adminUrl || '启动中'}\n数据目录：${app.getPath('userData')}`
            });
          }
        },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '操作',
      submenu: [
        { role: 'reload', label: '刷新' },
        {
          label: '打开本机后台地址',
          click: () => shell.openExternal(adminUrl)
        },
        {
          label: '打开数据目录',
          click: () => shell.openPath(app.getPath('userData'))
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(async () => {
  app.setName(productName);
  installMenu();
  try {
    const url = await startAdmin();
    createWindow(url);
  } catch (error) {
    log(`Startup failed: ${error?.stack || error?.message || error}`);
    dialog.showErrorBox(
      `${productName} 启动失败`,
      `本机后台没有启动成功：${error?.message || error}\n请查看数据目录里的 desktop.log。`
    );
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && adminUrl) {
      createWindow(adminUrl);
    }
  });
});

app.on('before-quit', () => {
  if (adminServer) {
    adminServer.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
