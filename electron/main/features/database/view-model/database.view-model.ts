import { ApiProperty } from '../../../api/api-property';

export class DatabaseViewModel {
  @ApiProperty()
  idDatabase!: string;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  host!: string;

  @ApiProperty()
  scheduleCount!: number;

  @ApiProperty()
  createdAt!: Date;
}
