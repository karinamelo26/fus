import { Transform } from 'class-transformer';
import { IsDate as _IsDate } from 'class-validator';

export function IsDate(): PropertyDecorator {
  return (target, propertyKey) => {
    Transform(({ value }) => (value ? new Date(value) : value))(target, propertyKey);
    _IsDate()(target, propertyKey);
  };
}
