import { app, BrowserWindow, Menu, shell, dialog } from 'electron';
import path from 'path';
import { dbManager } from './database/database';
import { seedDatabase } from './database/seed';
import { registerIpcHandlers, unregisterIpcHandlers } from './ipcHandlers';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const VITE_DEV_SERVER_URL = 'http://localhost:5173';

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (isDev) {
      try {
        const parsedUrl = new URL(navigationUrl);
        const devOrigin = new URL(VITE_DEV_SERVER_URL).origin;
        if (parsedUrl.origin !== devOrigin) {
          event.preventDefault();
          shell.openExternal(navigationUrl);
        }
      } catch {
        // ignore
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (event) => {
    if (mainWindow) {
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['是', '否'],
        title: '确认退出',
        message: '确定要退出特种设备锅炉检验系统吗？',
        defaultId: 1
      });
      if (choice === 1) {
        event.preventDefault();
      }
    }
  });

  loadMainWindow();
}

function loadMainWindow(): void {
  if (isDev) {
    mainWindow?.loadURL(VITE_DEV_SERVER_URL);
    mainWindow?.webContents.openDevTools();
  } else {
    const rendererPath = path.join(__dirname, '../renderer/index.html');
    mainWindow?.loadFile(rendererPath);
  }
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '刷新',
          accelerator: 'F5',
          click: () => {
            mainWindow?.webContents.reload();
          }
        },
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache();
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = mainWindow?.webContents.getZoomLevel() ?? 0;
            mainWindow?.webContents.setZoomLevel(currentZoom + 0.5);
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow?.webContents.getZoomLevel() ?? 0;
            mainWindow?.webContents.setZoomLevel(currentZoom - 0.5);
          }
        },
        {
          label: '重置缩放',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow?.webContents.setZoomLevel(0);
          }
        },
        { type: 'separator' },
        {
          label: '开发者工具',
          accelerator: isDev ? 'F12' : 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: '全屏',
          accelerator: 'F11',
          click: () => {
            mainWindow?.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      ]
    },
    {
      label: '工具',
      submenu: [
        {
          label: '初始化示例数据',
          click: async () => {
            if (mainWindow) {
              const choice = dialog.showMessageBoxSync(mainWindow, {
                type: 'warning',
                buttons: ['确定', '取消'],
                title: '初始化示例数据',
                message: '确定要初始化示例数据吗？这将清除现有数据。',
                defaultId: 1
              });
              if (choice === 0) {
                try {
                  await seedDatabase();
                  dialog.showMessageBoxSync(mainWindow, {
                    type: 'info',
                    title: '成功',
                    message: '示例数据初始化成功！'
                  });
                  mainWindow?.webContents.reload();
                } catch (error) {
                  dialog.showErrorBox(
                    '错误',
                    `初始化失败: ${error instanceof Error ? error.message : String(error)}`
                  );
                }
              }
            }
          }
        },
        {
          label: '打开数据目录',
          click: () => {
            const dbPath = dbManager.getDbPath();
            if (dbPath) {
              shell.showItemInFolder(dbPath);
            }
          }
        }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: '关闭窗口',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBoxSync(mainWindow!, {
              type: 'info',
              title: '关于特种设备锅炉检验系统',
              message: '特种设备锅炉检验系统',
              detail: `版本: ${app.getVersion()}\n\n用于特种设备锅炉的检验管理系统，支持设备管理、报检管理、排期管理、检验记录、缺陷管理、证书管理等功能。`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function setupProtocol(): void {
  // 预留协议注册位置，目前不需要
}

app.whenReady().then(async () => {
  try {
    setupProtocol();
    await dbManager.init();
    try {
      await seedDatabase();
    } catch (seedError) {
      console.warn('Seed data initialization warning:', seedError);
    }
    registerIpcHandlers();
    createWindow();
    createMenu();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    dialog.showErrorBox(
      '启动失败',
      `应用启动时发生错误: ${error instanceof Error ? error.message : String(error)}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  unregisterIpcHandlers();
  dbManager.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  unregisterIpcHandlers();
  dbManager.close();
});

app.on('will-quit', () => {
  unregisterIpcHandlers();
  dbManager.close();
});

app.on('web-contents-created', (_, contents) => {
  contents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox(
    '运行时错误',
    `发生未捕获的异常: ${error.message}\n\n请联系技术支持。`
  );
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
