import { round } from 'st-utils';

import { ConsoleColor } from '../logger/logger';

export function formatPerformanceTime(startMs: number, endMs: number): string[] {
  const time = endMs - startMs;
  const msFormatted = `+${round(time, 1)}ms`;
  let color: ConsoleColor;
  if (time <= 50) {
    color = ConsoleColor.FgGreen;
  } else if (time <= 200) {
    color = ConsoleColor.FgYellow;
  } else {
    color = ConsoleColor.FgRed;
  }
  return [color, msFormatted, ConsoleColor.Reset];
}
