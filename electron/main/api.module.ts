import { Module } from './api/module';
import { SchedulerController } from './features/scheduler/scheduler.controller';

@Module({
  controllers: [SchedulerController],
})
export class ApiModule {}
