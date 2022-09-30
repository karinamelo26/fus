import { ApiProperty } from '../../../api/api-property';

export class ScheduleViewModel {
  @ApiProperty()
  idSchedule!: string;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  idDatabase!: string;

  @ApiProperty()
  databaseName!: string;

  @ApiProperty()
  timer!: string;

  @ApiProperty()
  lastUpdated!: Date;
}
