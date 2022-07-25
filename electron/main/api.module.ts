import { Module } from './api/module';
import { DatabaseModule } from './features/database/database.module';
import { ScheduleModule } from './features/schedule/schedule.module';
import { TypeORMConfig } from './typeorm/typeorm-config';
import { TypeORMModule } from './typeorm/typeorm.module';

@Module({
  imports: [TypeORMModule.forRoot(TypeORMConfig), DatabaseModule, ScheduleModule],
})
export class ApiModule {}
