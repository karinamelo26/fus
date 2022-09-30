import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

import { ApiProperty } from '../../../api/api-property';
import { QueryHistoryCodeEnum } from '../query-history-code.enum';
import { QueryHistoryModeEnum } from '../query-history-mode.enum';

export class AddDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  query!: string;

  @ApiProperty()
  @IsDefined()
  @IsUUID()
  idSchedule!: string;

  @ApiProperty({ isEnum: true, type: () => QueryHistoryCodeEnum })
  @IsDefined()
  @IsEnum(QueryHistoryCodeEnum)
  code!: QueryHistoryCodeEnum;

  @ApiProperty({ optional: true })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ optional: true })
  @IsNumber()
  @IsPositive()
  @IsDefined()
  queryTime!: number;

  @ApiProperty({ isEnum: true, type: () => QueryHistoryModeEnum })
  @IsDefined()
  @IsEnum(QueryHistoryModeEnum)
  mode!: QueryHistoryModeEnum;
}
