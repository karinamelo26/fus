import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Max,
} from 'class-validator';

import { IsDate } from '../../../util/id-date';

export class GenerateMockDataDto {
  @IsDefined()
  @IsArray()
  idSchedules!: string[];

  @IsOptional()
  @IsUUID()
  idDatabase?: string;

  @IsDefined()
  @IsDate()
  from!: Date;

  @IsDefined()
  @IsDate()
  to!: Date;

  @IsDefined()
  @IsNumber()
  @IsPositive()
  @Max(1500)
  quantity!: number;
}
