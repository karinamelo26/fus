import {
  isFunction,
  isObject,
  isString,
  isNumber,
  isArray,
  isDate,
  isRegExp,
  isSymbol,
  isBoolean,
  isNil,
  noop,
} from 'st-utils';

import { isClass } from '../util/util';

import {
  ConsoleColor,
  ConsoleLevelColor,
  consoleLogFactory,
  CONSOLE_METHODS,
} from './console';
import type { LoggerFile } from './logger-file';

export enum LoggerLevel {
  log,
  warn,
  error,
}

interface LoggerV2Options {
  ignorePersistence?: boolean;
}

export class Logger {
  private constructor(private readonly prefix?: string, options: LoggerV2Options = {}) {
    // Logger is used on the build process, so we need to check if devMode is defined
    const level =
      typeof devMode === 'undefined' || !devMode ? LoggerLevel.error : LoggerLevel.log;
    if (!options.ignorePersistence) {
      Logger._preloadLoggerV2File();
    }
    for (const method of CONSOLE_METHODS) {
      const methodLevel = LoggerLevel[method];
      if (level > methodLevel) {
        this[method] = noop;
        continue;
      }
      this[method] = (...args: any[]) => {
        const prefixArgs = [`[${new Date().toLocaleString('pt-BR')}]`];
        if (this.prefix) {
          prefixArgs.push(ConsoleColor.FgMagenta, this.prefix, ConsoleColor.Reset);
        }
        const finalArgs = [
          ...prefixArgs,
          ConsoleLevelColor[method],
          ...args,
          ConsoleColor.Reset,
        ];
        if (!options.ignorePersistence) {
          Logger._persist(finalArgs);
        }
        // eslint-disable-next-line no-console
        return console[method](...finalArgs);
      };
    }
  }

  log!: typeof console.log;
  warn!: typeof console.warn;
  error!: typeof console.error;

  private static _loggerV2File: LoggerFile | null = null;

  static log = consoleLogFactory('log');
  static warn = consoleLogFactory('warn');
  static error = consoleLogFactory('error');

  private static async _preloadLoggerV2File(): Promise<void> {
    if (this._loggerV2File) {
      return;
    }
    this._loggerV2File = await this._getLoggerV2File();
  }

  private static async _getLoggerV2File(): Promise<LoggerFile> {
    if (!this._loggerV2File) {
      const { loggerV2File } = await import('./logger-file');
      this._loggerV2File = loggerV2File;
    }
    return this._loggerV2File;
  }

  private static async _persist(args: any[]): Promise<void> {
    const content = args
      .reduce((acc: string, item) => {
        if (isString(item)) {
          acc += item;
        } else if (isNumber(item) || isSymbol(item) || isBoolean(item) || isNil(item)) {
          acc += String(item);
        } else if (isDate(item)) {
          acc += item.toISOString();
        } else if (isRegExp(item)) {
          acc += `/${item.source}/${String(item.flags)}`;
        } else if (isArray(item) || isObject(item)) {
          acc += JSON.stringify(item, null, 4);
        }
        return acc;
      }, '')
      .replace(
        // eslint-disable-next-line no-control-regex -- remove all colors from log messages
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ' '
      );
    const loggerV2File = await this._getLoggerV2File();
    loggerV2File.enqueue(content);
  }

  static create(prefix: any, options?: LoggerV2Options): Logger {
    let name: string | undefined;
    if (isString(prefix)) {
      name = prefix;
    } else if (isClass(prefix) && prefix.name) {
      name = prefix.name;
    } else if (isObject(prefix)) {
      name = Object.getPrototypeOf(prefix)?.constructor?.name;
    } else if (isFunction(prefix)) {
      return this.create(prefix());
    }
    return new Logger(name, options);
  }
}
