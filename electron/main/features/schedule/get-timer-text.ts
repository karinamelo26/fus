import { Schedule } from '@prisma/client';

import { ScheduleFrequencyEnum } from './schedule-frequency.enum';

const map = new Map<ScheduleFrequencyEnum, string>()
  .set(ScheduleFrequencyEnum.Monthly, 'Once a month')
  .set(ScheduleFrequencyEnum.Weekly, 'Once a week')
  .set(ScheduleFrequencyEnum.Daily, 'Everyday');

export function getTimerText(schedule: Pick<Schedule, 'frequency'>): string {
  return map.get(schedule.frequency) ?? 'Unknown';
}
