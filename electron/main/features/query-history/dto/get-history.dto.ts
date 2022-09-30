import { IsDefined, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

import { ApiProperty } from '../../../api/api-property';

export class GetHistoryDto {
  @ApiProperty({ optional: true })
  @IsOptional()
  @IsUUID()
  idDatabase?: string;

  @ApiProperty({ optional: true })
  @IsOptional()
  @IsUUID()
  idSchedule?: string;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  daysPrior!: number;
}
