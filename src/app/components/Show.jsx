import { isFunction, isObject } from 'st-utils';

/**
 * @template T
 * @param {T} when
 * @param {React.ReactNode} fallback
 * @param {React.ReactNode | ((item: T) => React.ReactNode)} children
 * @returns {React.ReactNode}
 * @constructor
 */
export function Show({ when, fallback, children }) {
  function showChildren(data) {
    return isFunction(children) ? children(data) : children;
  }
  if (isObject(when) && 'isLoading' in when) {
    return when.isLoading ? fallback : showChildren(when.data);
  } else {
    return when ? showChildren(when) : fallback;
  }
}
