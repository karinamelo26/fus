import { dateInterceptor } from './date.interceptor';
import { round } from 'st-utils';

/**
 * @typedef {object} Response
 * @property {number} statusCode
 * @property {boolean} success
 * @property {string|null} [message]
 * @property {any|null} [data]
 */

/**
 *
 * @type {Record<string, (...args: any[]) => Promise<any>>}
 */
let apiInternal;
async function resolveApi() {
  if (!apiInternal) {
    await window['api-ready']();
    apiInternal = window['api-internal'];
  }
  return apiInternal;
}

/**
 * @typedef {object} Request
 * @property {string} path
 * @property {any[]} [data]
 */

/**
 * @typedef {(req: Request) => Request} RequestInterceptor
 */

/**
 * @typedef {(res: any) => any} ResponseInterceptor
 */

/**
 * @typedef {object} Interceptor
 * @property {RequestInterceptor} [request]
 * @property {ResponseInterceptor} [response]
 */

/**
 * @type {Interceptor[]}
 */
const interceptors = [dateInterceptor()];

/**
 * @type {RequestInterceptor[]}
 */
const requestInterceptors = interceptors
  .filter(interceptor => interceptor.request)
  .map(interceptor => interceptor.request);

/**
 * @type {ResponseInterceptor[]}
 */
const responseInterceptor = interceptors
  .filter(interceptor => interceptor.response)
  .map(interceptor => interceptor.response);

/**
 *
 * @param {string} path
 * @param {any} data
 * @returns {Promise<Response>}
 */
export async function api(path, data) {
  /* eslint-disable no-console */
  await resolveApi();
  /**
   * @type {Response}
   */
  let result;
  if (!apiInternal) {
    throw {
      success: false,
      statusCode: 500,
      message: 'API is not available. Build is broken or electron is not running!',
      data: null,
    };
  }
  import.meta.env.DEV && console.groupCollapsed(`Request: ${path}`);
  const startMs = import.meta.env.DEV ? performance.now() : 0;
  import.meta.env.DEV && console.log('Data: ', data);
  const req = requestInterceptors.reduce((acc, item) => item(acc), { path, data });
  import.meta.env.DEV && console.log('Data after interceptors: ', req.data);
  const method = apiInternal[req.path];
  if (!method) {
    result = {
      success: false,
      statusCode: 404,
      message: `Path ${path} not found`,
      data: null,
    };
  } else {
    import.meta.env.DEV && console.groupEnd();
    import.meta.env.DEV && console.groupCollapsed(`Response: ${path}`);
    try {
      /**
       * @type {Response}
       */
      const originalResult = await method(req.data);
      import.meta.env.DEV && console.log('Data: ', originalResult);
      result = {
        ...originalResult,
        data: responseInterceptor.reduce((acc, item) => item(acc), originalResult.data),
      };
      import.meta.env.DEV && console.log('Data after interceptors: ', result);
    } catch (error) {
      console.error(error);
      result = {
        success: false,
        statusCode: 500,
        message: 'Could not communicate with back-end',
        data: null,
      };
    }
  }
  import.meta.env.DEV && console.log('Time: ', `${round(performance.now() - startMs)}ms`);
  import.meta.env.DEV && console.groupEnd();
  /* eslint-enable no-console */
  if (result.success) {
    return result;
  }
  throw result;
}
