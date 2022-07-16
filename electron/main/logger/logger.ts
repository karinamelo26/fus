import { isFunction, isObject, isString } from 'st-utils';

import { isClass } from '../util/util';

type ConsoleMethod = 'log' | 'warn' | 'error';
const methods = ['log', 'warn', 'error'] as const;

function consoleLogFactory<K extends ConsoleMethod>(method: K): typeof console[K] {
  // eslint-disable-next-line no-console
  return (...args: any[]) => console[method](`[${new Date().toLocaleString('pt-BR')}]`, ...args);
}

export enum ConsoleColor {
  Reset = '\x1b[0m',
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',
  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',
  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
}

enum ConsoleLevelColor {
  error = ConsoleColor.FgRed,
  warn = ConsoleColor.FgYellow,
  log = ConsoleColor.FgWhite,
}

export class Logger {
  private constructor(private readonly prefix?: string) {
    for (const method of methods) {
      this[method] = (...args: any[]) => {
        const prefixArgs = [`[${new Date().toLocaleString('pt-BR')}]`];
        if (this.prefix) {
          prefixArgs.push(ConsoleColor.FgMagenta, this.prefix, ConsoleColor.Reset);
        }
        // eslint-disable-next-line no-console
        return console[method](...prefixArgs, ConsoleLevelColor[method], ...args, ConsoleColor.Reset);
      };
    }
  }

  log!: typeof console.log;
  warn!: typeof console.warn;
  error!: typeof console.error;

  static log = consoleLogFactory('log');
  static warn = consoleLogFactory('warn');
  static error = consoleLogFactory('error');

  static create(prefix: any): Logger {
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
    return new Logger(name);
  }
}
