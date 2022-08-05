import { Database } from '@prisma/client';

import { DatabaseTypeEnum } from '../database/database-type.enum';

import { QueryDriver } from './query-driver';

export class QueryDriverMSSQL extends QueryDriver {
  constructor(private readonly database: Database) {
    super();
  }

  readonly type = DatabaseTypeEnum.SQLServer;

  query<T = any>(/*query: string, params: any[]*/): Promise<T[]> {
    return Promise.resolve([]);
  }
}
