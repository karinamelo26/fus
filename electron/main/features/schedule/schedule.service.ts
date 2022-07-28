import { Injectable } from '../../di/injectable';

import { ScheduleRepository } from './schedule.repository';

@Injectable({ global: true })
export class ScheduleService {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}
}
