import 'reflect-metadata';
import { release } from 'os';
import { join } from 'path';

import { app, BrowserWindow, ipcMain, shell } from 'electron';

import { ApiModule } from './api.module';
import { bootstrap } from './bootstrap';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) {
  app.disableHardwareAcceleration();
}

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') {
  app.setAppUserModelId(app.getName());
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const DIST_PATH = app.isPackaged ? join(process.resourcesPath, 'app.asar', 'dist') : join(process.cwd(), 'dist');

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(DIST_PATH, 'electron', 'preload', 'index.js');
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = `http://localhost:4200`;
const indexHtml = join(DIST_PATH, 'index.html');

async function createWindow(): Promise<void> {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(DIST_PATH, 'favicon.svg'),
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true,
    },
  });
  win.maximize();

  if (app.isPackaged) {
    await win.loadFile(indexHtml);
  } else {
    await win.loadURL(url);
    win.webContents.openDevTools();
  }

  const api = await bootstrap(ApiModule);
  win.webContents.send('init-api', api.getPaths());

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
    win?.webContents.send('init-api', api.getPaths());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(params => {
    if (params.url.startsWith('https:')) {
      shell.openExternal(params.url);
    }
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) {
      win.restore();
    }
    win.focus();
  }
});

app.on('activate', async () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    await createWindow();
  }
});

// new window example arg: new windows url
ipcMain.handle('open-win', async (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  });

  if (app.isPackaged) {
    await childWindow.loadFile(indexHtml, { hash: arg });
  } else {
    await childWindow.loadURL(`${url}/#${arg}`);
  }
});
