import { round } from 'st-utils';

import { ConsoleColor } from '../logger/console';

export function calculateAndFormatPerformanceTime(
  startMs: number,
  endMs: number
): string[] {
  const time = endMs - startMs;
  return formatPerformanceTime(time);
}

export function formatPerformanceTime(time: number): string[] {
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
