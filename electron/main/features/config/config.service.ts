import { mkdir } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

import { app } from 'electron';

import { Injectable } from '../../di/injectable';
import { pathExists } from '../../util/path-exists';

@Injectable()
export class ConfigService {
  readonly distPath = devMode
    ? join(process.cwd(), 'dist')
    : join(app.getAppPath(), 'dist');
  readonly fusPath = join(homedir(), '.fus');
  readonly homePath = this._getHomePath();
  readonly databasePath = join(this.homePath, 'database', 'data.sqlite');
  readonly temporaryFilesPath = join(this.homePath, 'temporary_files');
  readonly logPath = join(this.homePath, 'log');

  private _getHomePath(): string {
    const paths = [this.fusPath];
    if (devMode) {
      paths.push('dev');
    }
    return join(...paths);
  }

  static readonly instance = new ConfigService();

  static async init(): Promise<ConfigService> {
    const config = this.instance;
    const fusFolderExists = await pathExists(config.fusPath);
    if (!fusFolderExists) {
      await mkdir(config.fusPath);
    }
    if (devMode) {
      const devPathExists = await pathExists(config.homePath);
      if (!devPathExists) {
        await mkdir(config.homePath);
      }
    }
    const temporaryFilesPathExists = await pathExists(config.temporaryFilesPath);
    if (!temporaryFilesPathExists) {
      await mkdir(config.temporaryFilesPath);
    }
    const logPathExists = await pathExists(config.logPath);
    if (!logPathExists) {
      await mkdir(config.logPath);
    }
    return config;
  }
}
