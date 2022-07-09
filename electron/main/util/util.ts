import { isFunction } from 'st-utils';
import { Class } from 'type-fest';

export function isClass<T>(target: any): target is Class<T> {
  return isFunction(target);
}
