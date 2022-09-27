import { dateInterceptor } from './date.interceptor';
import { round } from 'st-utils';
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
 * @typedef {object} ApiOptions
 * @property {boolean} [ignoreInterceptors]
 * @property {boolean} [ignoreRequestInterceptors]
 * @property {boolean} [ignoreResponseInterceptors]
 * @property {boolean} [fullResponse]
 */

/**
 * @template T, R
 * @param {string} path
 * @param {T} data
 * @param {ApiOptions} [options]
 * @returns {Promise<R>}
 */
async function apiInternal(path, data, options = {}) {
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
  let req = { path, data };
  if (!options.ignoreInterceptors && !options.ignoreRequestInterceptors) {
    req = requestInterceptors.reduce((acc, item) => item(acc), req);
  }
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
      // if (import.meta.env.DEV) {
      //   await new Promise((resolve) => setTimeout(resolve, random(250, 1500)));
      // }
      /**
       * @type {Response}
       */
      result = await method(req.data);
      if (!options.ignoreInterceptors && !options.ignoreResponseInterceptors) {
        result = {
          ...result,
          data: responseInterceptor.reduce((acc, item) => item(acc), result.data),
        };
      }
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
    if (options.fullResponse) {
      return result;
    }
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
 * @param {ApiOptions} [options]
 * @returns {ApiFunction}
 */
export function useApi(options = {}) {
  const { showLoading, hideLoading } = useLoadingState();

  return async (path, data) => {
    showLoading();
    return apiInternal(path, data, options).finally(() => {
      hideLoading();
    });
  };
}
