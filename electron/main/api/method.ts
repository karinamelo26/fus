import { StatusCodes } from 'http-status-codes';
import { orderBy } from 'st-utils';

import { createErrorResponse } from '../shared/create-error-response';

import { Controller, MethodMetadataResponse } from './controller';

export interface MethodOptions {
  code?: StatusCodes;
  summary?: string;
  description?: string;
  errorResponses?: MethodResponse[];
  okResponse?: Omit<MethodResponse, 'status'>;
}

export interface MethodResponse {
  status: StatusCodes;
  data?: () => any;
  isArray?: boolean;
  example?: () => any;
}

export function Method(path: string, options?: MethodOptions): MethodDecorator {
  return (target, _propertyKey) => {
    const propertyKey = String(_propertyKey);
    const newOptions: MethodOptions = { ...options };
    newOptions.errorResponses ??= [];
    const okResponse: MethodMetadataResponse = {
      isArray: false,
      status: newOptions.code ?? StatusCodes.OK,
      ...newOptions.okResponse,
    };
    const hasInternalServerError = newOptions.errorResponses.some(
      ({ status }) => status === StatusCodes.INTERNAL_SERVER_ERROR
    );
    if (!hasInternalServerError) {
      newOptions.errorResponses.push(
        createErrorResponse({ status: StatusCodes.INTERNAL_SERVER_ERROR })
      );
    }
    const hasBadRequestError = newOptions.errorResponses.some(
      ({ status }) => status === StatusCodes.BAD_REQUEST
    );
    Controller.upsertMethodMetadata(target.constructor, propertyKey, (metadata) => {
      if (!hasBadRequestError && metadata.parameters.some(Boolean)) {
        newOptions.errorResponses!.push(
          createErrorResponse({ status: StatusCodes.BAD_REQUEST })
        );
      }
      const responses = orderBy(
        [
          okResponse,
          ...newOptions.errorResponses!.map((response) => ({
            ...response,
            isArray: !!response.isArray,
          })),
        ],
        'status'
      );
      return {
        ...metadata,
        path,
        code: newOptions.code ?? metadata.code,
        summary: newOptions.summary,
        description: newOptions.description,
        responses,
      };
    });
  };
}
