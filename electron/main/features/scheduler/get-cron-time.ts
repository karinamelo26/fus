import { Schedule } from '@prisma/client';

import { ScheduleFrequencyEnum } from '../schedule/schedule-frequency.enum';

export function getCronTime(schedule: Schedule): string {
  switch (schedule.frequency) {
    case ScheduleFrequencyEnum.Monthly:
      return `0 ${schedule.hour} ${schedule.monthDay} * *`;
    case ScheduleFrequencyEnum.Weekly:
      return `0 ${schedule.hour} * * ${schedule.weekDay}`;
    case ScheduleFrequencyEnum.Daily:
      return `0 ${schedule.hour} * * *`;
  }
  throw new Error(`Could not get Cron time from ${schedule.name}`);
}
