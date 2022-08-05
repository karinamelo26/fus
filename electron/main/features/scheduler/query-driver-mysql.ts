import { Database } from '@prisma/client';
import { Connection, createConnection } from 'mysql';

import { DatabaseTypeEnum } from '../database/database-type.enum';

import { QueryDriver } from './query-driver';

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
      connection.connect(err => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (err) {
          reject(err);
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
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  private _query<T = any>(connection: Connection, query: string, params: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (errors, results) => {
        if (errors) {
          reject(errors);
          return;
        }
        resolve(results);
      });
    });
  }

  // TODO error handling
  async query<T = any>(query: string, params: any[]): Promise<T[]> {
    const connection = await this._createConnection();
    const results = await this._query(connection, query, params);
    await this._closeConnection(connection);
    return results;
  }
}
