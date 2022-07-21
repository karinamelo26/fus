import { IsDefined, IsNumber } from 'class-validator';

import { Controller } from '../../api/controller';
import { Data } from '../../api/data';
import { Method } from '../../api/method';

class Dto {
  @IsDefined()
  @IsNumber()
  id!: number;
}

@Controller('scheduler')
export class SchedulerController {
  @Method('get-all')
  async getAll(@Data() data: Dto): Promise<any[]> {
    return [data];
  }
}
