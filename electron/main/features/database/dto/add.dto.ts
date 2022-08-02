import { IsBoolean, IsDefined, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

import { DatabaseTypeEnum } from '../database-type.enum';

export class AddDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  host!: string;

  @IsDefined()
  @IsNumber()
  @IsPositive()
  port!: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  database!: string;

  @IsDefined()
  @IsEnum(DatabaseTypeEnum)
  type!: DatabaseTypeEnum;

  @IsDefined()
  @IsBoolean()
  active!: boolean;
}
