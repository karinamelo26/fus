import { AutoMap } from '@automapper/classes';

export class ScheduleViewModel {
  @AutoMap() idSchedule!: string;
  @AutoMap() active!: boolean;
  @AutoMap() name!: string;
  @AutoMap() idDatabase!: string;
  @AutoMap() databaseName!: string;
  @AutoMap() timer!: string;
  @AutoMap() lastUpdated!: Date;
}
