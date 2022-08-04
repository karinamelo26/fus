import { Schedule } from '@prisma/client';
import { CronJob } from 'cron';

import { QueryHistoryService } from '../query-history/query-history.service';

import { ScheduleFrequencyEnum } from './schedule-frequency.enum';

function getCronTime(schedule: Schedule): string {
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

export abstract class Scheduler {
  constructor(protected readonly schedule: Schedule, protected readonly queryHistoryService: QueryHistoryService) {
    this._cron = new CronJob(getCronTime(schedule), () => this._execute());
  }

  private readonly _cron: CronJob;

  private async _execute(): Promise<void> {
    /* let queryResults: any[];*/
    /*try {
      queryResults = await this.query();
    } catch (err) {}*/
  }

  start(): this {
    this._cron.start();
    return this;
  }

  stop(): this {
    this._cron.stop();
    return this;
  }

  abstract query(): Promise<any[]>;
}

/*export class MySQLScheduler extends Scheduler {}*/
