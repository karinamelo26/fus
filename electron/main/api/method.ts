import { StatusCodes } from 'http-status-codes';

import { Controller } from './controller';

export function Method(path: string, code?: StatusCodes): MethodDecorator {
  return (target, _propertyKey) => {
    const propertyKey = String(_propertyKey);
    Controller.upsertMethodMetadata(target.constructor, propertyKey, metadata => ({
      ...metadata,
      path,
      code: code ?? metadata.code,
    }));
  };
}
