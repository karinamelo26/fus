import { Class } from 'type-fest';

import { Api } from './api/api';
import { Provider } from './di/provider';
import { ScheduleService } from './features/schedule/schedule.service';

export async function bootstrap(module: Class<any>, providers?: Provider[]): Promise<Api> {
  const api = await Api.create(module, providers).init();
  const scheduleService = api.get(ScheduleService);
  await scheduleService.init();
  return api;
}
