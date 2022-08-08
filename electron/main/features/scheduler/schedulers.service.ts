import { Database, Schedule } from '@prisma/client';

import { Injectable } from '../../di/injectable';
import { Logger } from '../../logger/logger';
import { QueryHistoryService } from '../query-history/query-history.service';

import { DatabaseDriver } from './database-driver';
import { Scheduler } from './scheduler';

export type ScheduleWithDatabase = Schedule & { database: Database };

@Injectable({ global: true })
export class SchedulersService {
  constructor(private readonly queryHistoryService: QueryHistoryService) {}

  private readonly _logger = Logger.create(this);
  private readonly _schedulersMap = new Map<string, Scheduler>();
  private readonly _databasesMap = new Map<string, DatabaseDriver>();

  private _getOrCreateDatabaseDriver(database: Database): DatabaseDriver {
    let databaseDriver = this._databasesMap.get(database.id);
    if (!databaseDriver) {
      databaseDriver = new DatabaseDriver(database);
      this._databasesMap.set(database.id, databaseDriver);
    }
    return databaseDriver;
  }

  addSchedulers(schedules: ScheduleWithDatabase[]): Scheduler[] {
    return schedules.map(schedule => this.addScheduler(schedule));
  }

  addScheduler(schedule: ScheduleWithDatabase): Scheduler {
    if (this._schedulersMap.has(schedule.id)) {
      this._logger.warn(`Schedule ${schedule.id} already have a scheduler created`);
      return this._schedulersMap.get(schedule.id)!;
    }
    const databaseDriver = this._getOrCreateDatabaseDriver(schedule.database);
    const scheduler = new Scheduler(schedule, this.queryHistoryService, databaseDriver);
    if (!schedule.inactiveAt) {
      scheduler.start();
    }
    this._schedulersMap.set(schedule.id, scheduler);
    return scheduler;
  }

  startScheduler(idSchedule: string): void {
    const scheduler = this._schedulersMap.get(idSchedule);
    if (!scheduler) {
      this._logger.warn(`Scheduler ${idSchedule} not found.`);
      return;
    }
    scheduler.start();
  }

  stopScheduler(idSchedule: string): void {
    const scheduler = this._schedulersMap.get(idSchedule);
    if (!scheduler) {
      this._logger.warn(`Scheduler ${idSchedule} not found.`);
      return;
    }
    scheduler.stop();
  }
}