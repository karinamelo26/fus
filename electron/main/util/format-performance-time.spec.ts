import { ConsoleColor } from '../logger/logger';

import { formatPerformanceTime } from './format-performance-time';

describe.concurrent('formatPerformanceTime', () => {
  it('should return green', () => {
    expect(formatPerformanceTime(0, 50)).toEqual([ConsoleColor.FgGreen, '+50ms', ConsoleColor.Reset]);
  });

  it('should return green', () => {
    expect(formatPerformanceTime(0, 200)).toEqual([ConsoleColor.FgYellow, '+200ms', ConsoleColor.Reset]);
  });

  it('should return yellow', () => {
    expect(formatPerformanceTime(0, 201)).toEqual([ConsoleColor.FgRed, '+201ms', ConsoleColor.Reset]);
  });
});
