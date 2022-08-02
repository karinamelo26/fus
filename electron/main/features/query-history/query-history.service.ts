import { Prisma, QueryHistory } from '@prisma/client';
import { subDays } from 'date-fns';

import { Injectable } from '../../di/injectable';

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
}
