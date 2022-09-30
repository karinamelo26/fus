import { ApiProperty } from '../../../api/api-property';

export class DatabaseAllSummaryViewModel {
  @ApiProperty()
  successRate!: number;

  @ApiProperty()
  runCount!: number;

  @ApiProperty()
  scheduleActiveCount!: number;

  @ApiProperty()
  scheduleInactiveCount!: number;

  @ApiProperty()
  averageQueryRuntime!: number;
}
