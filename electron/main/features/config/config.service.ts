import { mkdir } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

import { Injectable } from '../../di/injectable';
import { pathExists } from '../../util/path-exists';

@Injectable()
export class ConfigService {
  readonly homePath = this._getHomePath();
  readonly databasePath = join(this.homePath, 'database', 'data.sqlite');
  readonly temporaryFilesPath = join(this.homePath, 'temporary_files');

  private _getHomePath(): string {
    const paths = [homedir(), '.fus'];
    if (devMode) {
      paths.push('dev');
    }
    return join(...paths);
  }

  static async init(): Promise<ConfigService> {
    const config = ConfigService.create();
    const promises: Promise<any>[] = [];
    const temporaryFilesPathExists = await pathExists(config.temporaryFilesPath);
    if (!temporaryFilesPathExists) {
      promises.push(mkdir(config.temporaryFilesPath));
    }
    if (devMode) {
      const devPathExists = await pathExists(config.homePath);
      if (!devPathExists) {
        promises.push(mkdir(config.homePath));
      }
    }
    await Promise.all(promises);
    return config;
  }

  static create(): ConfigService {
    return new ConfigService();
  }
}
