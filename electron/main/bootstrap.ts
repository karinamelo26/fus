import { Class } from 'type-fest';

import { Api } from './api/api';
import { ScheduleService } from './features/schedule/schedule.service';

export async function bootstrap(module: Class<any>): Promise<Api> {
  const api = await Api.create(module).init();
  const scheduleService = api.get(ScheduleService);
  await scheduleService.init();
  return api;
}
