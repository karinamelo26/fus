import { IsDefined, IsNumber, IsPositive } from 'class-validator';

import { ApiProperty } from '../../../api/api-property';

export class GetAllSummaryDto {
  @ApiProperty()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  daysPrior!: number;
}
