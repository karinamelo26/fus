import { getReasonPhrase, StatusCodes } from 'http-status-codes';

import { MethodResponse } from '../api/method';
import { Response } from '../api/response';

export function createErrorResponse(
  partial: Pick<Response, 'message' | 'data'> & { status: StatusCodes }
): MethodResponse {
  return {
    status: partial.status,
    example: (): Response => ({
      statusCode: partial.status,
      message: partial.message ?? 'string',
      success: false,
      status: getReasonPhrase(partial.status),
      data: {},
    }),
  };
}
