import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import { ApiProperty } from '../../../api/api-property';
import { HourType } from '../hour.type';
import { MonthDayType } from '../month-day.type';
import { ScheduleFrequencyEnum } from '../schedule-frequency.enum';
import { ScheduleFrequencyValidator } from '../schedule-frequency.validator';
import { WeekDayType } from '../week-day.type';

export class AddDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsDefined()
  @IsUUID()
  idDatabase!: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  query!: string;

  @ApiProperty({ isEnum: true, type: () => ScheduleFrequencyEnum })
  @IsDefined()
  @IsEnum(ScheduleFrequencyEnum)
  @ScheduleFrequencyValidator()
  frequency!: ScheduleFrequencyEnum;

  @ApiProperty({ optional: true, example: (): WeekDayType => 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  weekDay?: WeekDayType;

  @ApiProperty({ optional: true, example: (): MonthDayType => 28 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  monthDay?: MonthDayType;

  @ApiProperty({ example: (): HourType => 23 })
  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(23)
  hour!: HourType;

  @ApiProperty({ optional: true, example: () => 5_000 })
  @IsOptional()
  @IsNumber()
  @Min(5_000)
  timeout?: number;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  sheet!: string;

  @ApiProperty({ example: () => 'C:/Users/my.user/sheet.xlsx' })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  filePath!: string;

  @ApiProperty()
  @IsDefined()
  @IsBoolean()
  active!: boolean;
}
