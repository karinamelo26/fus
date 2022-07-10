import { Controller } from './controller';

export function Method(path: string): MethodDecorator {
  return (target, _propertyKey) => {
    const propertyKey = String(_propertyKey);
    Controller.upsertMethodMetadata(target.constructor, propertyKey, metadata => ({ ...metadata, path }));
  };
}
