import { isArray, isObject, isString } from 'st-utils';

export function dateInterceptor() {
  return { response: (res) => handleAny(res) };
}

const ISO_DATE_REGEXP =
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;

function handleAny(value) {
  if (isArray(value)) {
    value = handleArray(value);
  } else if (isObject(value)) {
    value = handleObject(value);
  } else if (isISODate(value)) {
    value = new Date(value);
  }
  return value;
}

function handleObject(object) {
  return Object.entries(object).reduce((newObject, [key, value]) => ({ ...newObject, [key]: handleAny(value) }), {});
}

function handleArray(value) {
  return value.map((item) => handleAny(item));
}

function isISODate(value) {
  return isString(value) && ISO_DATE_REGEXP.test(value);
}
