import { Schedule } from '@prisma/client';
import { CronJob } from 'cron';
import { Workbook, Worksheet } from 'exceljs';
import { orderBy, round } from 'st-utils';

import { Logger } from '../../logger/logger';
import { formatPerformanceTime } from '../../util/format-performance-time';
import { QueryHistoryCodeEnum } from '../query-history/query-history-code.enum';
import { QueryHistoryService } from '../query-history/query-history.service';

import { DatabaseDriver } from './database-driver';
import { getCronTime } from './get-cron-time';

export class Scheduler {
  constructor(
    private readonly schedule: Schedule,
    private readonly queryHistoryService: QueryHistoryService,
    private readonly databaseDriver: DatabaseDriver
  ) {
    const cronTime = getCronTime(schedule);
    this._cron = new CronJob(cronTime, () => this._execute());
    this._logger = Logger.create(`Scheduler [${this.idSchedule}]`);
  }

  private readonly _cron: CronJob;
  private readonly _logger: Logger;

  get idSchedule(): string {
    return this.schedule.id;
  }

  get idDatabase(): string {
    return this.schedule.idDatabase;
  }

  get isRunning(): boolean {
    return !!this._cron.running;
  }

  private async _resetWorksheet(): Promise<Worksheet> {
    const workbook = await new Workbook().xlsx.readFile(this.schedule.filePath);
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

  private async _execute(): Promise<void> {
    this._logger.log('Executing');
    this._logger.log('Getting database data');
    const startMs = performance.now();
    const data = await this.databaseDriver.query(this.schedule.query, []);
    this._logger.log('Finished executing database query', ...formatPerformanceTime(startMs, performance.now()));
    const queryTime = round(performance.now() - startMs);
    this._logger.log('Updating excel');
    const startMsExcel = performance.now();
    await this._updateExcel(data);
    this._logger.log('Finished updating excel', ...formatPerformanceTime(startMsExcel, performance.now()));
    this._logger.log('Adding a row to query_history');
    await this.queryHistoryService.add({
      queryTime,
      idSchedule: this.schedule.id,
      query: this.schedule.query,
      code: QueryHistoryCodeEnum.Success,
    });
    this._logger.log('Finished', ...formatPerformanceTime(startMs, performance.now()));
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
