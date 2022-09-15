import { Injectable } from '../../di/injectable';
import { fromEnumToIdName } from '../../shared/from-enum-to-id-name';
import { IdNameViewModel } from '../../shared/view-model/id-name.view-model';
import { QueryHistoryService } from '../query-history/query-history.service';
import { ScheduleService } from '../schedule/schedule.service';

import { DatabaseTypeEnum } from './database-type.enum';
import { DatabaseRepository } from './database.repository';
import { AddDto } from './dto/add.dto';
import { GetAllSummaryDto } from './dto/get-all-summary.dto';
import { GetAllDto } from './dto/get-all.dto';
import { GetSummaryDto } from './dto/get-summary.dto';
import { generateMetricsQueriesHistory } from './generate-metrics-queries-history';
import { DatabaseAllSummaryViewModel } from './view-model/database-all-summary.view-model';
import { DatabaseSummaryViewModel } from './view-model/database-summary.view-model';
import { DatabaseViewModel } from './view-model/database.view-model';

@Injectable({ global: true })
export class DatabaseService {
  constructor(
    private readonly databaseRepository: DatabaseRepository,
    private readonly queryHistoryService: QueryHistoryService,
    private readonly scheduleService: ScheduleService
  ) {}

  async getAll(dto: GetAllDto): Promise<DatabaseViewModel[]> {
    const databases = await this.databaseRepository.findMany({
      include: { _count: { select: { schedule: true } } },
      where: { inactiveAt: dto.active ? null : { not: null } },
      orderBy: { createdAt: 'asc' },
    });
    return databases.map((database) => ({
      active: !database.inactiveAt,
      createdAt: database.createdAt,
      idDatabase: database.id,
      name: database.name,
      host: database.host,
      scheduleCount: database._count.schedule,
    }));
  }

  getTypes(): IdNameViewModel[] {
    return fromEnumToIdName(DatabaseTypeEnum);
  }

  async getSummary(dto: GetSummaryDto): Promise<DatabaseSummaryViewModel> {
    const [database, queriesHistory] = await Promise.all([
      this.databaseRepository.findFirstOrThrow({
        select: { name: true, schedule: { select: { inactiveAt: true } } },
        where: { id: dto.idDatabase },
      }),
      this.queryHistoryService.getHistory({ idDatabase: dto.idDatabase, daysPrior: dto.daysPrior }),
    ]);
    return {
      idDatabase: dto.idDatabase,
      databaseName: database.name,
      scheduleActiveCount: database.schedule.filter((schedule) => !schedule.inactiveAt).length,
      scheduleInactiveCount: database.schedule.filter((schedule) => schedule.inactiveAt).length,
      ...generateMetricsQueriesHistory(queriesHistory),
    };
  }

  async getAllSummary(dto: GetAllSummaryDto): Promise<DatabaseAllSummaryViewModel> {
    const [[activeCount, inactiveCount], queriesHistory] = await Promise.all([
      this.scheduleService.getCountActiveAndInactive(),
      this.queryHistoryService.getHistory({ daysPrior: dto.daysPrior }),
    ]);
    return {
      scheduleActiveCount: activeCount,
      scheduleInactiveCount: inactiveCount,
      ...generateMetricsQueriesHistory(queriesHistory),
    };
  }

  async add(dto: AddDto): Promise<DatabaseViewModel> {
    const database = await this.databaseRepository.create({
      select: { id: true, name: true, host: true, inactiveAt: true, createdAt: true },
      data: {
        name: dto.name,
        host: dto.host,
        database: dto.database,
        username: dto.username,
        port: dto.port,
        password: dto.password,
        type: dto.type,
        inactiveAt: dto.active ? null : new Date(),
      },
    });
    return {
      idDatabase: database.id,
      name: database.name,
      host: database.host,
      active: !database.inactiveAt,
      createdAt: database.createdAt,
      scheduleCount: 0,
    };
  }
}
