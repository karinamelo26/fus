import { copyFile, open, readFile, rm } from 'fs/promises';
import { basename, extname, join } from 'path';

import { Schedule } from '@prisma/client';
import { CronJob } from 'cron';
import { Workbook, Worksheet } from 'exceljs';
import { lock } from 'proper-lockfile';
import { orderBy, round } from 'st-utils';
import { v4 } from 'uuid';

import { Injector } from '../../di/injector';
import { Logger } from '../../logger/logger';
import { formatPerformanceTime } from '../../util/format-performance-time';
import { pathExists } from '../../util/path-exists';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';
import { QueryHistoryCodeEnum } from '../query-history/query-history-code.enum';
import { QueryHistoryService } from '../query-history/query-history.service';
import { ScheduleService } from '../schedule/schedule.service';

import { DatabaseDriver } from './database-driver';
import { getCronTime } from './get-cron-time';
import { QueryError } from './query-error';
import { queryErrorEnumToQueryHistoryCodeEnum } from './query-error-enum-to-query-history-code-enum';
import { SchedulerError } from './scheduler-error';

export class Scheduler {
  constructor(
    injector: Injector,
    private readonly schedule: Schedule,
    private readonly databaseDriver: DatabaseDriver
  ) {
    this._queryHistoryService = injector.get(QueryHistoryService);
    this._scheduleService = injector.get(ScheduleService);
    this._notificationService = injector.get(NotificationService);
    this._configService = injector.get(ConfigService);
    this._logger = Logger.create(`Scheduler [${this.idSchedule}]`);
    const cronTime = getCronTime(schedule);
    this._cron = new CronJob(cronTime, () => this._execute());
  }

  private readonly _cron: CronJob;
  private readonly _logger: Logger;
  private readonly _queryHistoryService: QueryHistoryService;
  private readonly _scheduleService: ScheduleService;
  private readonly _notificationService: NotificationService;
  private readonly _configService: ConfigService;

  get idSchedule(): string {
    return this.schedule.id;
  }

  get idDatabase(): string {
    return this.schedule.idDatabase;
  }

  get isRunning(): boolean {
    return !!this._cron.running;
  }

  private _getTemporaryFilePath(temporaryFilename: string): string {
    return join(this._configService.TEMPORARY_FILES_PATH, temporaryFilename);
  }

  private _getFilePath(): string {
    return this.schedule.temporaryFilename
      ? this._getTemporaryFilePath(this.schedule.temporaryFilename)
      : this.schedule.filePath;
  }

  private async _createTemporaryFile(): Promise<string> {
    const { idDatabase, id, filePath } = this.schedule;
    const originalFilename = basename(filePath);
    const extension = extname(originalFilename);
    const date = new Date().toISOString();
    const filename = `${v4()}-${idDatabase}-${id}-${originalFilename}-${date}${extension}`;
    this._logger.log(`Creating temporary file: ${filename}`);
    await this._scheduleService.updateTemporaryFilename(id, filename);
    this.schedule.temporaryFilename = filename;
    const temporaryFilePath = this._getTemporaryFilePath(filename);
    await copyFile(this.schedule.filePath, temporaryFilePath);
    this._logger.log(`Temporary file created`);
    return temporaryFilePath;
  }

  private async _lockFile(): Promise<() => Promise<void>> {
    const filePath = this._getFilePath();
    return lock(filePath, { stale: this.schedule.timeout * 1.15 });
  }

  private async _isFileLocked(): Promise<boolean> {
    try {
      const fileHandle = await open(this.schedule.filePath, 'r+');
      await fileHandle.close();
      return false;
    } catch (_error) {
      const error: NodeJS.ErrnoException = _error;
      if (error.code === 'EBUSY') {
        return true;
      }
      throw _error;
    }
  }

  private async _checkForTemporaryFile(): Promise<void> {
    // TODO figure out a way to update schedule when the database changes
    // maybe maintain only the id here, and fetch everytime we need info
    const isFileLocked = await this._isFileLocked();
    if (!isFileLocked) {
      if (this.schedule.temporaryFilename) {
        await Promise.all([
          rm(this._getTemporaryFilePath(this.schedule.temporaryFilename)),
          this._scheduleService.updateTemporaryFilename(this.schedule.id, null),
        ]);
        this.schedule.temporaryFilename = null;
      }
      return;
    }
    if (this.schedule.temporaryFilename) {
      return;
    }
    await this._createTemporaryFile();
  }

  private async _getFile(): Promise<Buffer> {
    const filePath = this._getFilePath();
    return readFile(filePath);
  }

  private async _resetWorksheet(): Promise<Worksheet> {
    const file = await this._getFile();
    const workbook = await new Workbook().xlsx.load(file);
    const worksheet = workbook.worksheets.find(_worksheet => _worksheet.name === this.schedule.sheet);
    if (worksheet) {
      workbook.removeWorksheetEx(worksheet);
    }
    return workbook.addWorksheet(this.schedule.sheet);
  }

  private async _updateExcel(data: any[]): Promise<void> {
    const worksheet = await this._resetWorksheet();
    if (!data.length) {
      this._logger.warn('No database data found');
      await worksheet.workbook.xlsx.writeFile(this.schedule.filePath);
      return;
    }
    const columns = orderBy(Object.keys(data[0]));
    const firstRow = worksheet.getRow(1);
    for (const [colIndex, col] of columns.entries()) {
      firstRow.getCell(colIndex + 1).value = col;
    }
    firstRow.commit();
    for (const [index, item] of data.entries()) {
      const rowIndex = index + 2;
      const row = worksheet.getRow(rowIndex);
      for (const [colIndex, col] of columns.entries()) {
        row.getCell(colIndex + 1).value = item[col];
      }
      row.commit();
    }
    await worksheet.workbook.xlsx.writeFile(this.schedule.filePath);
  }

  private async _assertFileExists(): Promise<void> {
    const fileExists = await pathExists(this.schedule.filePath);
    if (fileExists) {
      return;
    }
    throw new SchedulerError(QueryHistoryCodeEnum.FileNotFound, 'File not found');
  }

  private async _getQueryResults(): Promise<any[]> {
    try {
      return await this.databaseDriver.query(this.schedule.query, { timeout: this.schedule.timeout });
    } catch (error) {
      let code = QueryHistoryCodeEnum.QueryError;
      if (error instanceof QueryError) {
        code = queryErrorEnumToQueryHistoryCodeEnum(error.code);
      }
      throw new SchedulerError(code, error?.message ?? 'Query error');
    }
  }

  private async _assertConnection(): Promise<void> {
    const canConnect = await this.databaseDriver.canConnect();
    if (canConnect) {
      return;
    }
    throw new SchedulerError(QueryHistoryCodeEnum.DatabaseNotAvailable, 'Could not connect to the database');
  }

  private async _handleKnownError(error: SchedulerError): Promise<void> {
    this._logger.error('Failed: ', error.message);
    await this._queryHistoryService.add({
      idSchedule: this.schedule.id,
      query: this.schedule.query,
      code: error.code,
      message: error.message,
      queryTime: 0,
    });
    this._notificationService.show({
      title: `${this.schedule.name} failed to execute`,
      body: 'Please check the schedule page to view the error',
    });
  }

  private async _handleError(error: Error): Promise<void> {
    try {
      if (error instanceof SchedulerError) {
        return await this._handleKnownError(error);
      }
      return await this._handleKnownError(
        new SchedulerError(QueryHistoryCodeEnum.Unknown, `Unknown error: ${error.message}`)
      );
    } catch (criticalError) {
      this._logger.error('CRITICAL ERROR', criticalError);
    }
  }

  private async _execute(): Promise<void> {
    try {
      this._logger.log('Executing');
      this._logger.log('Getting database data');
      const startMs = performance.now();
      await this._assertFileExists();
      await this._checkForTemporaryFile();
      this._logger.log('Locking file');
      const unlockFunction = await this._lockFile();
      await this._assertConnection();
      const startMsQuery = performance.now();
      const data = await this._getQueryResults();
      this._logger.log('Finished executing database query', ...formatPerformanceTime(startMs, performance.now()));
      const queryTime = round(performance.now() - startMsQuery);
      const startMsExcel = performance.now();
      this._logger.log('Unlocking file');
      await unlockFunction();
      this._logger.log('Updating excel');
      await this._updateExcel(data);
      this._logger.log('Finished updating excel', ...formatPerformanceTime(startMsExcel, performance.now()));
      this._logger.log('Adding a row to query_history');
      await this._queryHistoryService.add({
        queryTime,
        idSchedule: this.schedule.id,
        query: this.schedule.query,
        code: QueryHistoryCodeEnum.Success,
      });
      this._logger.log('Finished', ...formatPerformanceTime(startMs, performance.now()));
    } catch (error) {
      await this._handleError(error);
    }
  }

  start(): this {
    this._cron.start();
    return this;
  }

  stop(): this {
    this._cron.stop();
    return this;
  }
}
