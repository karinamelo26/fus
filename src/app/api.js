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
  const method = apiInternal[path];
  if (!method) {
    result = {
      success: false,
      statusCode: 404,
      message: `Path ${path} not found`,
      data: null,
    };
  } else {
    try {
      result = await method(...data);
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
