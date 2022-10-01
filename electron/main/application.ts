import { release } from 'os';
import { join } from 'path';

import { app, BrowserWindow, shell } from 'electron';

import { ApiModule } from './api.module';
import { Api } from './api/api';
import { bootstrap } from './bootstrap';
import { executeMigrations } from './execute-migrations';
import { ConfigService } from './features/config/config.service';

export class Application {
  private constructor(
    private readonly _configService: ConfigService,
    private readonly _browserWindow: BrowserWindow,
    private readonly _api: Api
  ) {}

  private _attachEvents(): void {
    app.on('window-all-closed', () => this.destroy());
    app.on('second-instance', () => this._onSecondInstance());
    app.on('activate', () => this._onActivate());
  }

  private _onSecondInstance(): void {
    if (this._browserWindow.isMinimized()) {
      this._browserWindow.restore();
    }
    this._browserWindow.focus();
  }

  private async _onActivate(): Promise<void> {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
      allWindows[0].focus();
    }
  }

  private _executeConfigurations(): void {
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
  }

  private _addExtensions(): void {
    if (devMode) {
      // const extensions = {
      //   redux: 'lmhkpmbekcpmknklioeibfkpmmfibljd',
      //   react: 'fmkadmapgofadopljbjfkapdkoienihi',
      // };
      // const { default: electronDevToolsInstaller } = await import('electron-devtools-installer');
      // await electronDevToolsInstaller(Object.values(extensions));
      // TODO investigate not working well on mac
    }
  }

  async init(): Promise<this> {
    this._addExtensions();

    this._browserWindow.maximize();

    if (devMode) {
      await this._browserWindow.loadURL('http://localhost:4200');
      if (!this._browserWindow.webContents.isDevToolsOpened()) {
        this._browserWindow.webContents.openDevTools();
      }
    } else {
      await this._browserWindow.loadFile(
        join(this._configService.distPath, 'index.html')
      );
      // TODO disable some options, like developer tools
    }

    if (!devMode) {
      await executeMigrations(`file:${this._configService.databasePath}`);
    }

    this._browserWindow.webContents.send('init-api', this._api.getPaths());

    this._browserWindow.webContents.on('did-finish-load', () => {
      this._browserWindow.webContents.send('init-api', this._api.getPaths());
    });

    // Make all links open with the browser, not with the application
    this._browserWindow.webContents.setWindowOpenHandler((params) => {
      if (params.url.startsWith('https:')) {
        shell.openExternal(params.url);
      }
      return { action: 'deny' };
    });

    this._attachEvents();
    this._executeConfigurations();
    return this;
  }

  destroy(): void {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  static async create(): Promise<Application> {
    const configService = await ConfigService.init();
    const preload = join(configService.distPath, 'electron', 'preload', 'index.js');
    const browserWindow = new BrowserWindow({
      title: 'File Update System',
      icon: join(configService.distPath, 'favicon.svg'),
      webPreferences: {
        preload,
        nodeIntegration: true,
        contextIsolation: true,
      },
    });
    const api = await bootstrap(ApiModule, [
      { provide: ConfigService, useValue: configService },
    ]);
    return new Application(configService, browserWindow, api).init();
  }
}
