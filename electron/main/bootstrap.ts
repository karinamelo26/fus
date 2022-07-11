import { Class } from 'type-fest';

import { Api } from './api/api';

export async function bootstrap(module: Class<any>): Promise<Api> {
  return await Api.create(module).init();
}
