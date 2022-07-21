import { validate, ValidationError } from 'class-validator';
import { coerceArray } from 'st-utils';

import { AnyObject } from '../util/any-object.type';

function formatValidationErrors(validationErrors: ValidationError[]): string[] {
  return validationErrors.reduce((acc, item) => [...acc, ...formatValidationError(item)], [] as string[]);
}

function formatValidationError(validationError: ValidationError): string[] {
  const errors: string[] = [];
  if (validationError.constraints) {
    errors.push(...Object.values(validationError.constraints));
  }
  if (validationError.children?.length) {
    errors.push(...formatValidationErrors(validationError.children));
  }
  return errors;
}

export async function validateData(instanceOrInstances: AnyObject | AnyObject[]): Promise<string[]> {
  const instances = coerceArray(instanceOrInstances);
  const errors = await Promise.all(instances.map(instance => validate(instance, { whitelist: true }))).then(
    nestedErrors => nestedErrors.flat()
  );
  return formatValidationErrors(errors);
}
