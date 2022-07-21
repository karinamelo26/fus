import { homedir } from 'os';
import { join } from 'path';

import { app } from 'electron';

import { Module } from './api/module';
import { DatabaseModule } from './database.module';
import { SchedulerModule } from './features/scheduler/scheduler.module';

@Module({
  imports: [
    DatabaseModule.forRoot({
      autoLoadEntities: true,
      type: 'sqlite',
      database: join(homedir(), '.fus', 'database', 'data.sqlite'),
      synchronize: false,
      logging: !app.isPackaged ? 'all' : ['error'],
      dropSchema: false,
      migrations: [join(process.cwd(), 'electron', 'main', 'database', 'migrations')],
      extra: {},
    }),
    SchedulerModule,
  ],
})
export class ApiModule {}
