import { Prisma, QueryHistory } from '@prisma/client';
import { subDays } from 'date-fns';
import { random, round, sample } from 'st-utils';

import { Injectable } from '../../di/injectable';
import { randomDate } from '../../util/random-date';

import { AddDto } from './dto/add.dto';
import { GenerateMockDataDto } from './dto/generate-mock-data.dto';
import { GetHistoryDto } from './dto/get-history.dto';
import { QueryHistoryRepository } from './query-history.repository';

@Injectable({ global: true })
export class QueryHistoryService {
  constructor(private readonly queryHistoryRepository: QueryHistoryRepository) {}

  async getHistory(dto: GetHistoryDto): Promise<QueryHistory[]> {
    const whereSchedule: Prisma.ScheduleWhereInput = {};
    if (dto.idDatabase) {
      whereSchedule.idDatabase = dto.idDatabase;
    }
    if (dto.idSchedule) {
      whereSchedule.id = dto.idSchedule;
    }
    return this.queryHistoryRepository.findMany({
      where: {
        schedule: whereSchedule,
        createdAt: { gte: subDays(new Date(), dto.daysPrior) },
      },
    });
  }

  async add(dto: AddDto): Promise<QueryHistory> {
    return this.queryHistoryRepository.create({
      data: {
        query: dto.query,
        idSchedule: dto.idSchedule,
        code: dto.code,
        message: dto.message,
        queryTime: dto.queryTime,
        mode: dto.mode,
      },
    });
  }

  async generateMockData(dto: GenerateMockDataDto): Promise<void> {
    const items: Omit<QueryHistory, 'id' | 'inactiveAt' | 'message'>[] = Array.from(
      { length: dto.quantity },
      () => {
        const idSchedule = sample(dto.idsSchedules);
        const createdAt = randomDate(dto.from, dto.to);
        const updatedAt = createdAt;
        const query = 'select *';
        const code = sample([0, 0, 0, 0, 1, 2, 3, 4, 5]);
        const queryTime = round(random(50, 2500) + Math.random());
        const mode = 0;
        return {
          createdAt,
          updatedAt,
          code,
          idSchedule,
          mode,
          query,
          queryTime,
        };
      }
    );
    await Promise.all(
      items.map((item) => this.queryHistoryRepository.create({ data: item }))
    );
  }
}
