import { Database } from '@prisma/client';
import { Connection, createConnection } from 'mysql';
import { MysqlErrorCodes } from 'mysql-error-codes';

import { DatabaseTypeEnum } from '../database/database-type.enum';

import { QueryDriver } from './query-driver';
import { QueryError } from './query-error';
import { QueryErrorEnum } from './query-error.enum';
import { QueryOptions } from './query-options';

export class QueryDriverMySQL extends QueryDriver {
  constructor(private readonly database: Database) {
    super();
  }

  readonly type = DatabaseTypeEnum.MySQL;

  private _createConnection(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const connection = createConnection({
        database: this.database.database,
        host: this.database.host,
        port: this.database.port,
        user: this.database.username,
        password: this.database.password,
      });
      connection.connect(error => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (error) {
          reject(new QueryError(QueryErrorEnum.ConnectionError, error.message));
          return;
        }
        resolve(connection);
      });
    });
  }

  private _closeConnection(connection: Connection): Promise<void> {
    return new Promise((resolve, reject) => {
      connection.end(error => {
        if (error) {
          reject(new QueryError(QueryErrorEnum.ConnectionError, error.message));
          return;
        }
        resolve();
      });
    });
  }

  private _query<T = any>(connection: Connection, query: string, options: QueryOptions): Promise<T[]> {
    return new Promise((resolve, reject) => {
      connection.query({ sql: query, timeout: options.timeout }, (error, results) => {
        if (error) {
          let code = QueryErrorEnum.Unknown;
          const message = error.message;
          if (error.errno === MysqlErrorCodes.ER_QUERY_TIMEOUT) {
            code = QueryErrorEnum.Timeout;
          }
          reject(new QueryError(code, message));
          return;
        }
        resolve(results);
      });
    });
  }

  async canConnect(): Promise<boolean> {
    try {
      const connection = await this._createConnection();
      return await new Promise((resolve, reject) => {
        connection.ping(error => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (error) {
            reject(error);
            return;
          }
          resolve(true);
        });
      });
    } catch {
      return false;
    }
  }

  async query<T = any>(query: string, options: QueryOptions): Promise<T[]> {
    try {
      const connection = await this._createConnection();
      const results = await this._query(connection, query, options);
      await this._closeConnection(connection);
      return results;
    } catch (error) {
      if (error instanceof QueryError) {
        throw error;
      }
      throw new QueryError(QueryErrorEnum.Unknown, `Unknown error: ${error.message}`);
    }
  }
}
