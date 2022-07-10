import { Controller } from './controller';

export function Method(path: string): MethodDecorator {
  return (target, _propertyKey) => {
    const propertyKey = String(_propertyKey);
    Controller.upsertMetadata(target.constructor, metadata => {
      metadata.methods.set(propertyKey, { path, propertyKey });
      return metadata;
    });
  };
}
