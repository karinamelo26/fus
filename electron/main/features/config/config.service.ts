import { homedir } from 'os';
import { join } from 'path';

import { Injectable } from '../../di/injectable';

@Injectable({ global: true })
export class ConfigService {
  readonly HOME_PATH = join(homedir(), '.fus');
  readonly TEMPORARY_FILES_PATH = join(this.HOME_PATH, 'temporary_files');
}
