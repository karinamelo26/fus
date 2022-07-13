import { homedir } from 'os';
import { join } from 'path';

import { app } from 'electron';

import { Module } from './api/module';
import { DatabaseModule } from './database.module';
import { SchedulerController } from './features/scheduler/scheduler.controller';
import { SchedulerRepository } from './features/scheduler/scheduler.repository';

@Module({
  imports: [
    DatabaseModule.forRoot({
      autoLoadEntities: true,
      type: 'better-sqlite3',
      database: join(homedir(), '.fus', 'database', 'data.sqlite'),
      synchronize: false,
      logging: !app.isPackaged ? 'all' : ['error'],
      dropSchema: false,
      migrations: [join(process.cwd(), 'electron', 'main', 'database', 'migrations')],
      repositories: [SchedulerRepository],
      // TODO add implicit driver here import from better-sqlite3
    }),
  ],
  controllers: [SchedulerController],
})
export class ApiModule {}
