import { Schedule } from '@prisma/client';

export function getTimerText(schedule: Schedule): string {
  if (schedule.monthDay && schedule.hour) {
    return 'Once a month';
  }
  if (schedule.weekDay && schedule.hour) {
    return 'Once a week';
  }
  if (schedule.hour) {
    return 'Everyday';
  }
  return 'Unknown';
}
