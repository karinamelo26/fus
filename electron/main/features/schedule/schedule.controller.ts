import { Controller } from '../../api/controller';
import { Data } from '../../api/data';
import { Method } from '../../api/method';

import { AddDto } from './dto/add.dto';
import { GetAllDto } from './dto/get-all.dto';
import { ScheduleService } from './schedule.service';
import { ScheduleViewModel } from './view-model/schedule.view-model';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Method('get-all')
  async getAll(@Data() dto: GetAllDto): Promise<ScheduleViewModel[]> {
    return this.scheduleService.getAll(dto);
  }

  @Method('add')
  async add(@Data() dto: AddDto): Promise<ScheduleViewModel> {
    return this.scheduleService.add(dto);
  }
}
