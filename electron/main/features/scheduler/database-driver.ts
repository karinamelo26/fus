import { Database } from '@prisma/client';
import { Class } from 'type-fest';

import { DatabaseTypeEnum } from '../database/database-type.enum';

import { QueryDriver } from './query-driver';
import { QueryDriverMSSQL } from './query-driver-mssql';
import { QueryDriverMySQL } from './query-driver-mysql';
import { QueryOptions } from './query-options';

export class DatabaseDriver {
  constructor(private readonly database: Database) {
    this._queryDriver = this._getQueryDriver();
  }

  private readonly _queryDriver: QueryDriver;

  private _getQueryDriver(): QueryDriver {
    const queryDriver = DatabaseDriver._mapQueryDrivers.get(this.database.type);
    if (!queryDriver) {
      throw new Error(`${this.database.name}. Database driver not supported for type ${this.database.type}`);
    }
    return new queryDriver(this.database);
  }

  canConnect(): Promise<boolean> {
    return this._queryDriver.canConnect();
  }

  query<T = any>(query: string, options: QueryOptions): Promise<T[]> {
    return this._queryDriver.query(query, options);
  }

  private static readonly _mapQueryDrivers = new Map<DatabaseTypeEnum, Class<QueryDriver, [Database]>>()
    .set(DatabaseTypeEnum.MySQL, QueryDriverMySQL)
    .set(DatabaseTypeEnum.SQLServer, QueryDriverMSSQL);
}
