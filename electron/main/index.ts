import 'reflect-metadata';
import './env';
import { release } from 'os';
import { join } from 'path';

import { app, BrowserWindow, ipcMain, shell } from 'electron';

import { ApiModule } from './api.module';
import { bootstrap } from './bootstrap';
import { executeMigrations } from './execute-migrations';
import { ConfigService } from './features/config/config.service';

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

const DIST_PATH = devMode ? join(process.cwd(), 'dist') : join(app.getAppPath(), 'dist');

let win: BrowserWindow | null = null;
const preload = join(DIST_PATH, 'electron', 'preload', 'index.js');
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

  if (devMode) {
    await win.loadURL(url);
    if (!win.webContents.isDevToolsOpened()) {
      win.webContents.openDevTools();
    }
  } else {
    await win.loadFile(indexHtml);
    // TODO disable some options, like developer tools
  }

  const configService = await ConfigService.init();

  if (!devMode) {
    await executeMigrations(`file:${configService.databasePath}`);
  }

  const api = await bootstrap(ApiModule, [{ provide: ConfigService, useValue: configService }]);
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

app
  .whenReady()
  .then(createWindow)
  .catch(error => {
    if (devMode) {
      throw error;
    }
    win?.webContents.send('show-on-console', {
      stack: error.stack,
      message: error.message,
      name: error.name,
      fullError: error,
    });
  });

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

  if (devMode) {
    await childWindow.loadURL(`${url}/#${arg}`);
  } else {
    await childWindow.loadFile(indexHtml, { hash: arg });
  }
});
