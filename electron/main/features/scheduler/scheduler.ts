import { copyFile, open, readFile, rm } from 'fs/promises';
import { extname, join } from 'path';

import { Schedule } from '@prisma/client';
import { CronJob } from 'cron';
import { format } from 'date-fns';
import { Workbook, Worksheet } from 'exceljs';
import { check, lock, unlock } from 'proper-lockfile';
import { isNotNil, orderBy, round } from 'st-utils';
import { v4 } from 'uuid';

import { Injector } from '../../di/injector';
import { Logger } from '../../logger/logger';
import { calculateAndFormatPerformanceTime } from '../../util/format-performance-time';
import { pathExists } from '../../util/path-exists';
import { TIME_CONSTANTS } from '../../util/time-constants';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';
import { QueryHistoryCodeEnum } from '../query-history/query-history-code.enum';
import { QueryHistoryModeEnum } from '../query-history/query-history-mode.enum';
import { QueryHistoryService } from '../query-history/query-history.service';
import { ScheduleInactiveCodeEnum } from '../schedule/schedule-inactive-code.enum';
import { ScheduleService } from '../schedule/schedule.service';

import { DatabaseDriver } from './database-driver';
import { getCronTime } from './get-cron-time';
import { QueryError } from './query-error';
import { queryErrorEnumToQueryHistoryCodeEnum } from './query-error-enum-to-query-history-code-enum';
import { SchedulerError } from './scheduler-error';

export class Scheduler {
  constructor(injector: Injector, schedule: Schedule, private readonly databaseDriver: DatabaseDriver) {
    this._cachedSchedule = schedule;
    this._idSchedule = schedule.id;
    this._queryHistoryService = injector.get(QueryHistoryService);
    this._scheduleService = injector.get(ScheduleService);
    this._notificationService = injector.get(NotificationService);
    this._configService = injector.get(ConfigService);
    this._logger = Logger.create(`Scheduler [${this._idSchedule}]`);
    const cronTime = getCronTime(schedule);
    this._cron = new CronJob(cronTime, () => this.execute(QueryHistoryModeEnum.Scheduled));
  }

  private readonly _idSchedule: string;
  private readonly _cron: CronJob;
  private readonly _logger: Logger;
  private readonly _queryHistoryService: QueryHistoryService;
  private readonly _scheduleService: ScheduleService;
  private readonly _notificationService: NotificationService;
  private readonly _configService: ConfigService;

  private _cachedSchedule: Schedule | null;
  private _cachedScheduleTimer: NodeJS.Timeout | null = null;
  private _failedAttempts = 0;

  private _resetCachedSchedule(): void {
    this._cachedSchedule = null;
    if (this._cachedScheduleTimer) {
      clearTimeout(this._cachedScheduleTimer);
    }
  }

  private async _getSchedule(): Promise<Schedule> {
    if (!this._cachedSchedule) {
      this._cachedSchedule = await this._scheduleService.getOne(this._idSchedule);
      this._cachedScheduleTimer = setTimeout(() => {
        this._resetCachedSchedule();
      }, TIME_CONSTANTS['15_MINUTES_IN_MS']);
    }
    return this._cachedSchedule;
  }

  private _getTemporaryFilePath(temporaryFilename: string): string {
    return join(this._configService.temporaryFilesPath, temporaryFilename);
  }

  private async _getFilePath(): Promise<string> {
    const schedule = await this._getSchedule();
    return schedule.temporaryFilename ? this._getTemporaryFilePath(schedule.temporaryFilename) : schedule.filePath;
  }

  private async _createTemporaryFile(): Promise<string> {
    const { id, filePath } = await this._getSchedule();
    const extension = extname(filePath);
    const date = format(new Date(), 'yyyy-MM-dd');
    const filename = `${v4()}-${date}${extension}`;
    this._logger.log(`Creating temporary file: ${filename}`);
    await this._scheduleService.updateTemporaryFilename(id, filename);
    this._resetCachedSchedule();
    const temporaryFilePath = this._getTemporaryFilePath(filename);
    await copyFile(filePath, temporaryFilePath);
    this._logger.log(`Temporary file created`);
    return temporaryFilePath;
  }

  private async _lockFile(): Promise<() => Promise<void>> {
    const filePath = await this._getFilePath();
    const { timeout } = await this._getSchedule();
    return lock(filePath, { stale: timeout * 1.15 });
  }

  private async _isFileLocked(): Promise<boolean> {
    try {
      const { filePath } = await this._getSchedule();
      const fileHandle = await open(filePath, 'r+');
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
    this._logger.log('Checking for temporary file');
    let { id, temporaryFilename } = await this._getSchedule();
    const isFileLocked = await this._isFileLocked();
    this._logger.log(`File is locked: ${isFileLocked}`);
    if (temporaryFilename) {
      const fileExists = await pathExists(this._getTemporaryFilePath(temporaryFilename));
      if (!fileExists) {
        this._logger.log(
          'Temporary file found on database, but actual file does not exists. Updating the database to null'
        );
        await this._scheduleService.updateTemporaryFilename(id, null);
        this._resetCachedSchedule();
        temporaryFilename = null;
      }
    }
    if (!isFileLocked) {
      if (temporaryFilename) {
        this._logger.log('File is not locked, deleting temporary file and updating database to null');
        await Promise.all([
          rm(this._getTemporaryFilePath(temporaryFilename)),
          this._scheduleService.updateTemporaryFilename(id, null),
        ]);
        this._resetCachedSchedule();
        temporaryFilename = null;
      }
      return;
    }
    if (temporaryFilename) {
      return;
    }
    await this._createTemporaryFile();
  }

  private async _getFile(): Promise<Buffer> {
    const filePath = await this._getFilePath();
    this._logger.log('File path: ', filePath);
    return readFile(filePath);
  }

  private async _resetWorksheet(): Promise<Worksheet> {
    const { sheet } = await this._getSchedule();
    const file = await this._getFile();
    const workbook = await new Workbook().xlsx.load(file);
    const worksheet = workbook.worksheets.find((_worksheet) => _worksheet.name === sheet);
    if (worksheet) {
      workbook.removeWorksheetEx(worksheet);
    }
    return workbook.addWorksheet(sheet);
  }

  private async _updateExcel(data: any[]): Promise<void> {
    const filePath = await this._getFilePath();
    const worksheet = await this._resetWorksheet();
    if (!data.length) {
      this._logger.warn('No database data found');
      await worksheet.workbook.xlsx.writeFile(filePath);
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
    await worksheet.workbook.xlsx.writeFile(filePath);
  }

  private async _assertFileExists(): Promise<void> {
    const { filePath } = await this._getSchedule();
    const fileExists = await pathExists(filePath);
    if (fileExists) {
      return;
    }
    throw new SchedulerError(QueryHistoryCodeEnum.FileNotFound, 'File not found');
  }

  private async _getQueryResults(): Promise<any[]> {
    try {
      const { query, timeout } = await this._getSchedule();
      return await this.databaseDriver.query(query, { timeout });
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

  private async _handleKnownError(error: SchedulerError, mode: QueryHistoryModeEnum): Promise<void> {
    this._logger.error('Failed: ', error.message);
    this._failedAttempts++;
    const filePath = await this._getFilePath();
    // Check if file is locked, if the error isn't file not found
    if (error.code !== QueryHistoryCodeEnum.FileNotFound && (await check(filePath))) {
      // If it is, try to unlock it
      await unlock(filePath);
    }
    const { id, query, name, failedAttemptsBeforeInactivation } = await this._getSchedule();
    await this._queryHistoryService.add({
      idSchedule: id,
      query,
      code: error.code,
      message: error.message,
      queryTime: 0,
      mode,
    });
    let bodyNotification = 'Please check the schedule page to view the error';
    if (error.code === QueryHistoryCodeEnum.FileNotFound) {
      bodyNotification += '\nThis schedule is being inactivated because the file was not found';
      await this._scheduleService.inactivate(this._idSchedule, ScheduleInactiveCodeEnum.FileNotFound);
    }
    const isSqlRelatedError = new Set([
      QueryHistoryCodeEnum.QueryError,
      QueryHistoryCodeEnum.Timeout,
      QueryHistoryCodeEnum.DatabaseNotAvailable,
    ]).has(error.code);
    if (
      isSqlRelatedError &&
      isNotNil(failedAttemptsBeforeInactivation) &&
      this._failedAttempts >= failedAttemptsBeforeInactivation
    ) {
      bodyNotification += '\nThis schedule is being inactivated because is exceeded the maximum failed attempts';
      await this._scheduleService.inactivate(this._idSchedule, ScheduleInactiveCodeEnum.QueryExecutionError);
    }
    this._notificationService.show({
      title: `${name} failed to execute`,
      body: bodyNotification,
    });
  }

  private async _handleError(error: Error, mode: QueryHistoryModeEnum): Promise<void> {
    try {
      if (error instanceof SchedulerError) {
        return await this._handleKnownError(error, mode);
      }
      return await this._handleKnownError(
        new SchedulerError(QueryHistoryCodeEnum.Unknown, `Unknown error: ${error.message}`),
        mode
      );
    } catch (criticalError) {
      this._logger.error('CRITICAL ERROR', criticalError);
    }
  }

  async execute(mode: QueryHistoryModeEnum): Promise<void> {
    try {
      this._logger.log('Executing');
      const startMs = performance.now();
      await this._assertFileExists();
      await this._checkForTemporaryFile();
      this._logger.log('Locking file');
      const unlockFunction = await this._lockFile();
      await this._assertConnection();
      this._logger.log('Getting database data');
      const startMsQuery = performance.now();
      const data = await this._getQueryResults();
      this._logger.log(
        'Finished executing database query',
        ...calculateAndFormatPerformanceTime(startMs, performance.now())
      );
      const queryTime = round(performance.now() - startMsQuery);
      const startMsExcel = performance.now();
      this._logger.log('Unlocking file');
      await unlockFunction();
      this._logger.log('Updating excel');
      await this._updateExcel(data);
      this._logger.log(
        'Finished updating excel',
        ...calculateAndFormatPerformanceTime(startMsExcel, performance.now())
      );
      this._logger.log('Adding a row to query_history');
      const { id, query } = await this._getSchedule();
      await this._queryHistoryService.add({
        queryTime,
        idSchedule: id,
        query,
        code: QueryHistoryCodeEnum.Success,
        mode,
      });
      this._failedAttempts = 0;
      this._logger.log('Finished', ...calculateAndFormatPerformanceTime(startMs, performance.now()));
    } catch (error) {
      await this._handleError(error, mode);
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
