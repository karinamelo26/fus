import { Module } from '../../api/module';
import { TypeORMModule } from '../../typeorm.module';

import { SchedulerController } from './scheduler.controller';
import { SchedulerRepository } from './scheduler.repository';

@Module({
  imports: [TypeORMModule.forChild([SchedulerRepository])],
  controllers: [SchedulerController],
})
export class SchedulerModule {}
