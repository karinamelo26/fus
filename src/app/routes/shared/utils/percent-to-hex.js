/**
 * @param {number} percent
 * @returns {string}
 */
export function percentToHex(percent) {
  percent = Math.max(0, Math.min(100, percent));
  const intValue = Math.round((percent / 100) * 255);
  const hexValue = intValue.toString(16);
  return hexValue.padStart(2, '0').toUpperCase();
}
