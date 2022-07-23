import { homedir } from 'os';
import { join } from 'path';

import { app } from 'electron';

import { Module } from './api/module';
import { DatabaseModule } from './features/database/database.module';
import { SchedulerModule } from './features/scheduler/scheduler.module';
import { NamingStrategy } from './naming-strategy';
import { TypeORMModule } from './typeorm.module';

@Module({
  imports: [
    TypeORMModule.forRoot({
      autoLoadEntities: true,
      type: 'sqlite',
      database: join(homedir(), '.fus', 'database', 'data.sqlite'),
      synchronize: false,
      logging: !app.isPackaged ? 'all' : ['error'],
      dropSchema: false,
      migrations: [join(process.cwd(), 'electron', 'main', 'database', 'migrations')],
      extra: {},
      namingStrategy: new NamingStrategy(),
    }),
    SchedulerModule,
    DatabaseModule,
  ],
})
export class ApiModule {}
