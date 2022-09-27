import { Fragment, useEffect } from 'react';
import { isFunction } from 'st-utils';

/**
 * @typedef {Object} ForEachItemExtra
 * @property {number} index
 * @property {number} count
 * @property {boolean} first
 * @property {boolean} last
 * @property {boolean} even
 * @property {boolean} odd
 * @property {any} key
 */

/**
 * @template T
 * @param {T[]} each
 * @param {React.ReactNode} fallback
 * @param {(item: T, options: ForEachItemExtra) => React.ReactNode} children
 * @param {keyof T | ((item: T) => any)} trackBy
 * @returns {React.ReactNode}
 * @constructor
 */
export function For({ each, fallback, children, trackBy }) {
  /**
   * @param {T} item
   * @param {number} index
   * @return {ForEachItemExtra}
   */
  function getItemExtras(item, index) {
    const odd = !((index + 1) % 2);
    return {
      count: each.length,
      first: !index,
      last: index === each.length - 1,
      index,
      odd,
      even: !odd,
      key: getKey(item, index),
    };
  }

  /**
   *
   * @param {T} item
   * @param {number} index
   * @return {any}
   */
  function getKey(item, index) {
    return isFunction(trackBy) ? trackBy(item) : (trackBy && item?.[trackBy]) || index;
  }

  /**
   *
   * @param {T} item
   * @param {number} index
   * @return {React.ReactNode}
   */
  function getItem(item, index) {
    const options = getItemExtras(item, index);
    return <Fragment key={options.key}>{children(item, options)}</Fragment>;
  }

  useEffect(() => {
    if (!trackBy) {
      // eslint-disable-next-line no-console
      console.warn('trackBy should be used to avoid unnecessary re-renders');
    }
  }, [trackBy]);

  return each ? each.map((item, index) => getItem(item, index)) : fallback;
}
