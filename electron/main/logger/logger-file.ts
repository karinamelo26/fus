import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import { format } from 'date-fns';
import { auditTime, BehaviorSubject, concatMap, filter } from 'rxjs';

import { ConfigService } from '../features/config/config.service';
import { pathExists } from '../util/path-exists';

export class LoggerFile {
  private constructor() {
    this._init();
  }

  private readonly _configService = ConfigService.instance;
  private readonly _queue$ = new BehaviorSubject<string[]>([]);

  private _init(): void {
    this._queue$
      .pipe(
        filter((contents) => !!contents.length),
        auditTime(2_500),
        concatMap((logContent) => {
          this._queue$.next([]);
          return this._saveContent(logContent);
        })
      )
      .subscribe();
  }

  private _getFilePath(): string {
    return join(this._configService.logPath, `${format(new Date(), 'yyyy-MM-dd')}.log`);
  }

  private async _getOrCreateFile(): Promise<string> {
    const filePath = this._getFilePath();
    let file = '';
    if (await pathExists(filePath)) {
      file = await readFile(filePath, { encoding: 'utf-8' });
    }
    return file;
  }

  private async _saveContent(contents: string[]): Promise<void> {
    try {
      const file = await this._getOrCreateFile();
      await writeFile(this._getFilePath(), `${file}${contents.join('\n')}\n`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Could not save log files', error);
    }
  }

  enqueue(content: string): void {
    this._queue$.next([...this._queue$.value, content]);
  }

  static create(): LoggerFile {
    return new LoggerFile();
  }
}

export const loggerV2File = LoggerFile.create();
