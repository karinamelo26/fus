import { Schedule } from '@prisma/client';

import { Injectable } from '../../di/injectable';
import { SchedulersService } from '../scheduler/schedulers.service';

import { AddDto } from './dto/add.dto';
import { GetAllDto } from './dto/get-all.dto';
import { UpdateDto } from './dto/update.dto';
import { getTimerText } from './get-timer-text';
import { ScheduleRepository } from './schedule.repository';
import { ScheduleViewModel } from './view-model/schedule.view-model';

@Injectable({ global: true })
export class ScheduleService {
  constructor(
    private readonly scheduleRepository: ScheduleRepository,
    private readonly schedulersService: SchedulersService
  ) {}

  async init(): Promise<void> {
    const schedules = await this.scheduleRepository.findMany({ include: { database: true } });
    this.schedulersService.addSchedulers(schedules);
  }

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

  async getOne(idSchedule: string): Promise<Schedule> {
    return this.scheduleRepository.findFirstOrThrow({ where: { id: idSchedule } });
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
        filePath: dto.filePath,
        sheet: dto.sheet,
      },
      include: { database: true },
    });
    this.schedulersService.addScheduler(schedule);
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

  async updateTemporaryFilename(idSchedule: string, temporaryFilename: string | null): Promise<void> {
    await this.scheduleRepository.update({
      where: { id: idSchedule },
      data: { temporaryFilename },
    });
  }

  async update({ idSchedule, ...dto }: UpdateDto): Promise<ScheduleViewModel> {
    const schedule = await this.scheduleRepository.update({
      where: { id: idSchedule },
      data: { name: dto.name, query: dto.query },
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

  async execute(idSchedule: string): Promise<void> {
    await this.schedulersService.executeScheduler(idSchedule);
  }
}
