import { homedir } from 'os';
import { join } from 'path';

import { app } from 'electron';
import { DataSource } from 'typeorm';

export async function createConnection(): Promise<DataSource> {
  const databasePath = join(homedir(), '.fus', 'database', 'data.sqlite');
  return new DataSource({
    type: 'better-sqlite3',
    database: databasePath,
    synchronize: false,
    logging: app.isPackaged ? 'all' : ['error'],
    dropSchema: false,
    migrations: [join(process.cwd(), 'electron', 'main', 'database', 'migrations')],
  }).initialize();
}
