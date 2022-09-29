import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

import { ApiProperty } from '../../../api/api-property';
import { DatabaseTypeEnum } from '../database-type.enum';

export class AddDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  host!: string;

  @ApiProperty()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  port!: number;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  database!: string;

  @ApiProperty({ isEnum: true, type: () => DatabaseTypeEnum })
  @IsDefined()
  @IsEnum(DatabaseTypeEnum)
  type!: DatabaseTypeEnum;

  @ApiProperty()
  @IsDefined()
  @IsBoolean()
  active!: boolean;
}
