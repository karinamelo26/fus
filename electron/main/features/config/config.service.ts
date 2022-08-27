import { mkdir } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

import { Injectable } from '../../di/injectable';
import { pathExists } from '../../util/path-exists';

const DATABASE_PATHS = devMode ? ['dev', 'database'] : ['database'];

@Injectable()
export class ConfigService {
  readonly homePath = join(homedir(), '.fus');
  readonly databasePath = join(this.homePath, ...DATABASE_PATHS, 'data.sqlite');
  readonly temporaryFilesPath = join(this.homePath, 'temporary_files');

  static async init(): Promise<ConfigService> {
    const config = ConfigService.create();
    const promises: Promise<any>[] = [];
    const temporaryFilesPathExists = await pathExists(config.temporaryFilesPath);
    if (!temporaryFilesPathExists) {
      promises.push(mkdir(config.temporaryFilesPath));
    }
    if (devMode) {
      const devPath = join(config.homePath, 'dev');
      const devPathExists = await pathExists(devPath);
      if (!devPathExists) {
        promises.push(mkdir(devPath));
      }
    }
    await Promise.all(promises);
    return config;
  }

  static create(): ConfigService {
    return new ConfigService();
  }
}
