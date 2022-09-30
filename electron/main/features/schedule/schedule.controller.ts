import { Controller } from '../../api/controller';
import { Data } from '../../api/data';
import { Method } from '../../api/method';

import { AddDto } from './dto/add.dto';
import { ExecuteDto } from './dto/execute.dto';
import { GetAllDto } from './dto/get-all.dto';
import { UpdateDto } from './dto/update.dto';
import { ScheduleService } from './schedule.service';
import { ScheduleViewModel } from './view-model/schedule.view-model';

@Controller('schedule', { summary: 'All related to schedules table' })
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Method('get-all', {
    summary: 'Get all schedules',
    okResponse: { data: () => ScheduleViewModel, isArray: true },
  })
  async getAll(@Data() dto: GetAllDto): Promise<ScheduleViewModel[]> {
    return this.scheduleService.getAll(dto);
  }

  @Method('add', {
    summary: 'Add a new schedule',
    okResponse: { data: () => ScheduleViewModel },
  })
  async add(@Data() dto: AddDto): Promise<ScheduleViewModel> {
    return this.scheduleService.add(dto);
  }

  @Method('update', {
    summary: 'Update a schedule',
    okResponse: { data: () => ScheduleViewModel },
  })
  async update(@Data() dto: UpdateDto): Promise<ScheduleViewModel> {
    return this.scheduleService.update(dto);
  }

  @Method('execute', {
    summary: 'Execute a schedule',
    okResponse: { data: () => undefined },
  })
  async execute(@Data() dto: ExecuteDto): Promise<void> {
    await this.scheduleService.execute(dto.idSchedule);
  }
}
