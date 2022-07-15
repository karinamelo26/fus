/**
 * @typedef {object} Response
 * @property {number} statusCode
 * @property {boolean} success
 * @property {string|null} [message]
 * @property {any|null} [data]
 */

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
  let result;
  if (!window.api) {
    throw {
      success: false,
      statusCode: 500,
      message: 'API is not available. Build is broken!',
      data: null,
    };
  }
  const method = window.api[path];
  if (!method) {
    result = {
      success: false,
      statusCode: 404,
      message: `Path ${path} not found`,
      data: null,
    };
  } else {
    try {
      result = await window.api[path](...data);
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
  if (result.success) {
    return result;
  }
  throw result;
}
