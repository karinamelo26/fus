import { IsDefined, IsUUID } from 'class-validator';

import { ApiProperty } from '../../../api/api-property';

export class ExecuteDto {
  @ApiProperty()
  @IsDefined()
  @IsUUID()
  idSchedule!: string;
}
