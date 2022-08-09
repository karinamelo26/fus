import { IsDefined, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

import { QueryHistoryCodeEnum } from '../query-history-code.enum';

export class AddDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsDefined()
  @IsUUID()
  idSchedule!: string;

  @IsDefined()
  @IsEnum(QueryHistoryCodeEnum)
  code!: QueryHistoryCodeEnum;

  @IsString()
  @IsOptional()
  message?: string;

  @IsNumber()
  @IsPositive()
  @IsDefined()
  queryTime!: number;
}
