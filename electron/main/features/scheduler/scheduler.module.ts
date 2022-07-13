import { Module } from '../../api/module';
import { DatabaseModule } from '../../database.module';

import { SchedulerController } from './scheduler.controller';
import { SchedulerRepository } from './scheduler.repository';

@Module({
  imports: [DatabaseModule.forChild([SchedulerRepository])],
  controllers: [SchedulerController],
})
export class SchedulerModule {}
