import { DatabaseTypeEnum } from '../database/database-type.enum';

import { QueryOptions } from './query-options';

export abstract class QueryDriver {
  abstract readonly type: DatabaseTypeEnum;
  abstract query<T = any>(query: string, options: QueryOptions): Promise<T[]>;
  abstract canConnect(): Promise<boolean>;
}
