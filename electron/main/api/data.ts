import { ReflectMetadataTypesEnum } from '../util/reflect-metadata-types.enum';

import { Controller } from './controller';

export interface DataOptions {
  type?: any;
  optional?: boolean;
  isArray?: boolean;
}

export function Data(options?: DataOptions): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const reflectType = Reflect.getMetadata(ReflectMetadataTypesEnum.paramTypes, target, propertyKey)?.[parameterIndex];
    Controller.upsertMethodMetadata(target.constructor, String(propertyKey), metadata => {
      metadata.parameters[parameterIndex] = {
        type: options?.type ?? reflectType,
        optional: options?.optional ?? false,
        index: parameterIndex,
        isArray: options?.isArray ?? false,
      };
      return metadata;
    });
  };
}
