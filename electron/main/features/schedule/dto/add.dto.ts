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

import { HourType } from '../hour.type';
import { MonthDayType } from '../month-day.type';
import { ScheduleFrequencyEnum } from '../schedule-frequency.enum';
import { ScheduleFrequencyValidator } from '../schedule-frequency.validator';
import { WeekDayType } from '../week-day.type';

export class AddDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDefined()
  @IsUUID()
  idDatabase!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsDefined()
  @IsEnum(ScheduleFrequencyEnum)
  @ScheduleFrequencyValidator()
  frequency!: ScheduleFrequencyEnum;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  weekDay?: WeekDayType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  monthDay?: MonthDayType;

  @IsDefined()
  @IsNumber()
  @Min(0)
  @Max(23)
  hour!: HourType;

  @IsOptional()
  @IsNumber()
  @Min(5_000)
  timeout?: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  sheet!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  filePath!: string;

  @IsDefined()
  @IsBoolean()
  active!: boolean;
}
