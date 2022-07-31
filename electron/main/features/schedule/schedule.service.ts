import { Injectable } from '../../di/injectable';

import { GetAllDto } from './dto/get-all.dto';
import { getTimerText } from './get-timer-text';
import { ScheduleRepository } from './schedule.repository';
import { ScheduleViewModel } from './view-model/schedule.view-model';

@Injectable({ global: true })
export class ScheduleService {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}

  async getAll(dto: GetAllDto): Promise<ScheduleViewModel[]> {
    const schedules = await this.scheduleRepository.findMany({
      include: { database: { select: { name: true } } },
      where: { inactiveAt: dto.active ? null : { not: null } },
      orderBy: { createdAt: 'asc' },
    });
    return schedules.map(schedule => ({
      name: schedule.name,
      active: !schedule.inactiveAt,
      idSchedule: schedule.id,
      idDatabase: schedule.idDatabase,
      databaseName: schedule.database.name,
      lastUpdated: schedule.updatedAt,
      timer: getTimerText(schedule),
    }));
  }

  async getCountActiveAndInactive(): Promise<[active: number, inactive: number]> {
    const schedules = await this.scheduleRepository.findMany({
      select: { inactiveAt: true },
    });
    return [
      schedules.filter(schedule => !schedule.inactiveAt).length,
      schedules.filter(schedule => schedule.inactiveAt).length,
    ];
  }
}
