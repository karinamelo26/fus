import { StatusCodes } from 'http-status-codes';

import { Controller } from './controller';

export interface MethodOptions {
  code?: StatusCodes;
  summary?: string;
  description?: string;
  responses?: MethodResponse[];
}

interface MethodResponse {
  status: StatusCodes;
  data?: () => any;
  isArray?: boolean;
}

export function Method(path: string, options?: MethodOptions): MethodDecorator {
  return (target, _propertyKey) => {
    const propertyKey = String(_propertyKey);
    Controller.upsertMethodMetadata(target.constructor, propertyKey, (metadata) => ({
      ...metadata,
      path,
      code: options?.code ?? metadata.code,
      summary: options?.summary,
      description: options?.description,
      responses: (options?.responses ?? []).map((response) => ({
        ...response,
        isArray: !!response.isArray,
      })),
    }));
  };
}
