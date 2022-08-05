import { DatabaseTypeEnum } from '../database/database-type.enum';

export abstract class QueryDriver {
  abstract readonly type: DatabaseTypeEnum;
  abstract query<T = any>(query: string, params: any[]): Promise<T[]>;
}
