import { forwardRef } from 'react';
import { isObject } from 'st-utils';
import { Link } from 'react-router-dom';

/**
 * @typedef {import('react-router-dom').LinkProps} LinkProps
 */

/**
 * @typedef {{ to: LinkProps['to'] & { query: Record<string, any> } }} BetterLinkToProp
 */

/**
 * @typedef {LinkProps & React.RefAttributes<HTMLAnchorElement> & BetterLinkToProp} BetterLinkProps
 */

/**
 *
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<BetterLinkProps> & React.RefAttributes<unknown>>}
 */
// eslint-disable-next-line prefer-arrow-callback
export const BetterLink = forwardRef(function BetterLink({ to: originalTo, ...props }, ref) {
  /**
   *
   * @returns {string | LinkProps['to']}
   */
  function getTo() {
    let to = originalTo;
    if (isObject(to) && to.query) {
      const url = new URLSearchParams(to.query);
      to = { ...to, search: url.toString() };
    }
    return to;
  }
  return <Link {...props} ref={ref} to={getTo()}></Link>;
});
