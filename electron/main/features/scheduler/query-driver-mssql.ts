import { Database } from '@prisma/client';
import { connect, ConnectionPool, RequestError } from 'mssql';

import { TIME_CONSTANTS } from '../../util/time-constants';
import { DatabaseTypeEnum } from '../database/database-type.enum';

import { QueryDriver } from './query-driver';
import { QueryDriverCanConnectResponse } from './query-driver-can-connect-response';
import { QueryError } from './query-error';
import { QueryErrorEnum } from './query-error.enum';
import { QueryOptions } from './query-options';

export class QueryDriverMSSQL extends QueryDriver {
  constructor(private readonly database: Database) {
    super();
  }

  readonly type = DatabaseTypeEnum.SQLServer;

  private async _getConnection(options: QueryOptions): Promise<ConnectionPool> {
    try {
      const connection = await connect({
        database: this.database.database,
        server: this.database.host,
        port: this.database.port,
        user: this.database.username,
        password: this.database.password,
        requestTimeout: options.timeout,
      });
      return connection.connect();
    } catch (error) {
      throw new QueryError(QueryErrorEnum.ConnectionError, error.message);
    }
  }

  private async _query<T = any>(connection: ConnectionPool, query: string): Promise<T[]> {
    try {
      const results = await connection.query(query);
      return results.recordset;
    } catch (error) {
      let code = QueryErrorEnum.Unknown;
      let message: string = error.messsage;
      if (error instanceof RequestError) {
        if (error.code === 'ETIMEOUT') {
          code = QueryErrorEnum.Timeout;
          message = 'Query timeout';
        } else if (error.code === 'EREQUEST') {
          code = QueryErrorEnum.QueryError;
          message = `Query error number: ${error.number}`;
        }
      }
      throw new QueryError(code, message);
    }
  }

  async canConnect(): Promise<QueryDriverCanConnectResponse> {
    try {
      const connection = await this._getConnection({ timeout: TIME_CONSTANTS['15_SECONDS_IN_MS'] });
      await connection.query('select 1');
      return {
        canConnect: true,
        message: 'Connection OK',
      };
    } catch (error) {
      return {
        message: error.message ?? 'Unknown error',
        canConnect: false,
      };
    }
  }

  async query<T = any>(query: string, options: QueryOptions): Promise<T[]> {
    try {
      const connection = await this._getConnection(options);
      const results = await this._query(connection, query);
      await connection.close();
      return results;
    } catch (error) {
      if (error instanceof QueryError) {
        throw error;
      }
      throw new QueryError(QueryErrorEnum.Unknown, `Unknown error: ${error.message}`);
    }
  }
}
