import { dateInterceptor } from './date.interceptor';

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
export async function api(path, ...data) {
  /**
   * @type {Response}
   */
  await resolveApi();
  let result;
  if (!apiInternal) {
    throw {
      success: false,
      statusCode: 500,
      message: 'API is not available. Build is broken or electron is not running!',
      data: null,
    };
  }
  const req = requestInterceptors.reduce((acc, item) => item(acc), { path, data });
  const method = apiInternal[req.path];
  if (!method) {
    result = {
      success: false,
      statusCode: 404,
      message: `Path ${path} not found`,
      data: null,
    };
  } else {
    try {
      const originalResult = await method(...req.data);
      result = responseInterceptor.reduce((acc, item) => item(acc), originalResult);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      result = {
        success: false,
        statusCode: 500,
        message: 'Could not communicate with back-end',
        data: null,
      };
    }
  }
  if (result.success) {
    return result;
  }
  throw result;
}
