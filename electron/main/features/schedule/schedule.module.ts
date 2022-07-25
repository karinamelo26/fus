import { Module } from '../../api/module';
import { TypeORMModule } from '../../typeorm/typeorm.module';

import { ScheduleController } from './schedule.controller';
import { ScheduleRepository } from './schedule.repository';

@Module({
  imports: [TypeORMModule.forChild([ScheduleRepository])],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
