import { Controller } from '../../api/controller';
import { Method } from '../../api/method';

@Controller('scheduler')
export class SchedulerController {
  @Method('get-all')
  async getAll(): Promise<any[]> {
    return [{}];
  }
}
