import { isArray, isDate, isObject, isUndefined } from 'st-utils';

export function formatResponse(body: any): any {
  if (isArray(body)) {
    return body.map((item) => formatResponse(item));
  } else if (isDate(body)) {
    return body.toISOString();
  } else if (isObject(body)) {
    const entries = Object.entries(body);
    return entries.reduce((acc, [key, value]) => {
      if (isUndefined(value)) {
        return acc;
      }
      return { ...acc, [key]: formatResponse(value) };
    }, {});
  }
  return body;
}
