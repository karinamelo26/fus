import { Database, Schedule } from '@prisma/client';

import { NotFoundException } from '../../api/exception';
import { Injectable } from '../../di/injectable';
import { Injector } from '../../di/injector';
import { Logger } from '../../logger/logger';
import { QueryHistoryModeEnum } from '../query-history/query-history-mode.enum';

import { DatabaseDriver } from './database-driver';
import { Scheduler } from './scheduler';

export type ScheduleWithDatabase = Schedule & { database: Database };

@Injectable({ global: true })
export class SchedulersService {
  constructor(private readonly injector: Injector) {}

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
    const scheduler = new Scheduler(this.injector, schedule, databaseDriver);
    if (!schedule.inactiveAt) {
      this._logger.log(`Starting schedule [${schedule.id}]`);
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

  async executeScheduler(idSchedule: string): Promise<void> {
    const scheduler = this._schedulersMap.get(idSchedule);
    if (!scheduler) {
      throw new NotFoundException(`Scheduler with id [${idSchedule}] not found`);
    }
    await scheduler.execute(QueryHistoryModeEnum.Manual);
  }
}
