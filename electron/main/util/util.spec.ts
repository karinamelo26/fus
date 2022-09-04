import { noop } from 'st-utils';

import { isClass } from './util';

describe('util', () => {
  describe('isClass', () => {
    it('should return true if is class', () => {
      expect(isClass(class {})).toBe(true);
    });

    it('should return true if is function', () => {
      expect(isClass(noop)).toBe(true);
    });

    it('should return false if any other value', () => {
      expect(isClass([])).toBe(false);
      expect(isClass({})).toBe(false);
      expect(isClass('')).toBe(false);
      expect(isClass(1)).toBe(false);
      expect(isClass(NaN)).toBe(false);
      expect(isClass(/a/)).toBe(false);
      expect(isClass(Symbol())).toBe(false);
      expect(isClass(new (class {})())).toBe(false);
    });
  });
});
