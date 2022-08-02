import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isNotNil } from 'st-utils';

import { HourType } from './hour.type';
import { MonthDayType } from './month-day.type';
import { ScheduleFrequencyEnum } from './schedule-frequency.enum';
import { WeekDayType } from './week-day.type';

interface Dto {
  monthDay?: MonthDayType;
  weekDay?: WeekDayType;
  hour: HourType;
}

@ValidatorConstraint({ name: 'ScheduleFrequencyValidator' })
export class ScheduleFrequencyValidatorConstraint implements ValidatorConstraintInterface {
  validate(value: ScheduleFrequencyEnum, validationArguments: ValidationArguments): boolean {
    const object = validationArguments.object as Dto;
    switch (value) {
      case ScheduleFrequencyEnum.Monthly:
        return isNotNil(object.monthDay) && isNotNil(object.hour);
      case ScheduleFrequencyEnum.Weekly:
        return isNotNil(object.weekDay) && isNotNil(object.hour);
      case ScheduleFrequencyEnum.Daily:
        return isNotNil(object.hour);
    }
  }

  defaultMessage(): string {
    return 'Schedule frequency arguments are wrong';
  }
}

export function ScheduleFrequencyValidator(validationOptions?: ValidationOptions): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'ScheduleFrequencyValidator',
      target: target.constructor,
      propertyName: String(propertyKey),
      options: validationOptions,
      validator: ScheduleFrequencyValidatorConstraint,
    });
  };
}
