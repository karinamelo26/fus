import { Injectable } from '../../di/injectable';

import { AddDto } from './dto/add.dto';
import { GetAllDto } from './dto/get-all.dto';
import { getTimerText } from './get-timer-text';
import { ScheduleRepository } from './schedule.repository';
import { ScheduleViewModel } from './view-model/schedule.view-model';

@Injectable({ global: true })
export class ScheduleService {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}

  async getAll(dto: GetAllDto): Promise<ScheduleViewModel[]> {
    const schedules = await this.scheduleRepository.findMany({
      where: { inactiveAt: dto.active ? null : { not: null } },
      orderBy: { createdAt: 'asc' },
      select: {
        name: true,
        inactiveAt: true,
        id: true,
        idDatabase: true,
        frequency: true,
        updatedAt: true,
        database: { select: { name: true } },
      },
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

  async add(dto: AddDto): Promise<ScheduleViewModel> {
    const schedule = await this.scheduleRepository.create({
      data: {
        name: dto.name,
        idDatabase: dto.idDatabase,
        hour: dto.hour,
        monthDay: dto.monthDay,
        query: dto.query,
        timeout: dto.timeout,
        weekDay: dto.weekDay,
        frequency: dto.frequency,
        inactiveAt: dto.active ? null : new Date(),
      },
      select: {
        name: true,
        inactiveAt: true,
        id: true,
        idDatabase: true,
        updatedAt: true,
        frequency: true,
        database: { select: { name: true } },
      },
    });
    return {
      name: schedule.name,
      active: !schedule.inactiveAt,
      idSchedule: schedule.id,
      idDatabase: schedule.idDatabase,
      databaseName: schedule.database.name,
      lastUpdated: schedule.updatedAt,
      timer: getTimerText(schedule),
    };
  }
}
