import {
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Max,
} from 'class-validator';

import { ApiProperty } from '../../../api/api-property';
import { IsDate } from '../../../util/id-date';

export class GenerateMockDataDto {
  @ApiProperty({ type: () => String, isArray: true })
  @IsDefined()
  @IsArray()
  idSchedules!: string[];

  @ApiProperty({ optional: true })
  @IsOptional()
  @IsUUID()
  idDatabase?: string;

  @ApiProperty()
  @IsDefined()
  @IsDate()
  from!: Date;

  @ApiProperty()
  @IsDefined()
  @IsDate()
  to!: Date;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  @Max(1500)
  quantity!: number;
}
