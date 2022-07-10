import { ReflectMetadataTypes } from '../util/reflect';

import { Controller } from './controller';

export interface DataOptions {
  type?: any;
  optional?: boolean;
}

export function Data(options?: DataOptions): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    Controller.upsertMethodMetadata(target.constructor, String(propertyKey), metadata => {
      const parameterMetadata = metadata.parameters.get(parameterIndex) ?? { index: parameterIndex, type: null };
      const reflectType = Reflect.getMetadata(ReflectMetadataTypes.paramTypes, target.constructor)?.[parameterIndex];
      metadata.parameters.set(parameterIndex, {
        ...parameterMetadata,
        type: options?.type ?? reflectType,
        optional: options?.optional ?? false,
      });
      return metadata;
    });
  };
}
