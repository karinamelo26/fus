import { IsDefined, IsNumber, IsPositive, IsUUID } from 'class-validator';

import { ApiProperty } from '../../../api/api-property';

export class GetSummaryDto {
  @ApiProperty()
  @IsDefined()
  @IsUUID()
  idDatabase!: string;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  daysPrior!: number;
}
