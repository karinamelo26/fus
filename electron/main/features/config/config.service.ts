import { mkdir } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

import { Injectable } from '../../di/injectable';
import { pathExists } from '../../util/path-exists';

@Injectable({ global: true, useFactory: () => ConfigService.init() })
export class ConfigService {
  readonly HOME_PATH = join(homedir(), '.fus');
  readonly TEMPORARY_FILES_PATH = join(this.HOME_PATH, 'temporary_files');

  static async init(): Promise<ConfigService> {
    const config = new ConfigService();
    const temporaryFilesPathExists = await pathExists(config.TEMPORARY_FILES_PATH);
    if (!temporaryFilesPathExists) {
      await mkdir(config.TEMPORARY_FILES_PATH);
    }
    return config;
  }
}
