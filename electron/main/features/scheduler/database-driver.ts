import { Database } from '@prisma/client';
import { Class } from 'type-fest';

import { DatabaseTypeEnum } from '../database/database-type.enum';

import { QueryDriver } from './query-driver';
import { QueryDriverMSSQL } from './query-driver-mssql';
import { QueryDriverMySQL } from './query-driver-mysql';

export class DatabaseDriver {
  constructor(private readonly database: Database) {}

  private readonly _queryDriver = this._getQueryDriver();

  private _getQueryDriver(): QueryDriver {
    const queryDriver = DatabaseDriver._mapQueryDrivers.get(this.database.type);
    if (!queryDriver) {
      throw new Error(`${this.database.name}. Database driver not supported for type ${this.database.type}`);
    }
    return new queryDriver(this.database);
  }

  query<T = any>(query: string, params: any[]): Promise<T[]> {
    return this._queryDriver.query(query, params);
  }

  private static readonly _mapQueryDrivers = new Map<DatabaseTypeEnum, Class<QueryDriver, [Database]>>()
    .set(DatabaseTypeEnum.MySQL, QueryDriverMySQL)
    .set(DatabaseTypeEnum.SQLServer, QueryDriverMSSQL);
}
