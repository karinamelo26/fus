import { Database } from '@prisma/client';
import { connect } from 'mssql';

import { DatabaseTypeEnum } from '../database/database-type.enum';

import { QueryDriver } from './query-driver';

export class QueryDriverMSSQL extends QueryDriver {
  constructor(private readonly database: Database) {
    super();
  }

  readonly type = DatabaseTypeEnum.SQLServer;

  // TODO implement params
  // TODO error handling
  async query<T = any>(query: string /* params: any[]*/): Promise<T[]> {
    const connection = await connect({
      database: this.database.database,
      server: this.database.host,
      port: this.database.port,
      user: this.database.username,
      password: this.database.password,
    });
    const results = await connection.query(query);
    return results.recordset;
  }
}
