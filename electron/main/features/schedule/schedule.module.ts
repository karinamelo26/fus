import { Module } from '../../api/module';

import { ScheduleController } from './schedule.controller';

@Module({
  controllers: [ScheduleController],
})
export class ScheduleModule {}
