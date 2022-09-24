import { dateInterceptor } from './date.interceptor';
import { random, round } from 'st-utils';
import { useLoadingState } from '../components/LoadingBar/loading-bar.state';

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
let apiBackEnd;
async function resolveApi() {
  if (!apiBackEnd) {
    await window['api-ready']();
    apiBackEnd = window['api-internal'];
  }
  return apiBackEnd;
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
  .filter((interceptor) => interceptor.request)
  .map((interceptor) => interceptor.request);

/**
 * @type {ResponseInterceptor[]}
 */
const responseInterceptor = interceptors
  .filter((interceptor) => interceptor.response)
  .map((interceptor) => interceptor.response);

/**
 * @template T, R
 * @param {string} path
 * @param {T} data
 * @returns {Promise<R>}
 */
async function apiInternal(path, data) {
  /* eslint-disable no-console */
  await resolveApi();
  /**
   * @type {Response}
   */
  let result;
  if (!apiBackEnd) {
    throw {
      success: false,
      statusCode: 500,
      message: 'API is not available. Build is broken or electron is not running!',
      data: null,
    };
  }
  const startMs = import.meta.env.DEV ? performance.now() : 0;
  const req = requestInterceptors.reduce((acc, item) => item(acc), { path, data });
  import.meta.env.DEV && console.log(`[${path}] Request`, req.data);
  const method = apiBackEnd[req.path];
  if (!method) {
    result = {
      success: false,
      statusCode: 404,
      message: `Path ${path} not found`,
      data: null,
    };
  } else {
    try {
      // Delay the request to test stuff
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, random(250, 1500)));
      }
      /**
       * @type {Response}
       */
      const originalResult = await method(req.data);
      result = {
        ...originalResult,
        data: responseInterceptor.reduce((acc, item) => item(acc), originalResult.data),
      };
      import.meta.env.DEV && console.log(`[${path}] Response`, result);
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
  import.meta.env.DEV &&
    console.log(`[${path}] Request time`, `${round(performance.now() - startMs)}ms`);
  /* eslint-enable no-console */
  if (result.success) {
    return result.data;
  }
  throw result;
}

/**
 * @typedef ApiFunction
 * @template T, R
 * @function
 * @param {string} path
 * @param {T} data
 * @returns {Promise<R>}
 */

/**
 * @template T, R
 * @returns {ApiFunction}
 */
export function useApi() {
  const { showLoading, hideLoading } = useLoadingState();

  return async (path, data) => {
    showLoading();
    return apiInternal(path, data).finally(() => {
      hideLoading();
    });
  };
}
