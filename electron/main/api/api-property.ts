import { isNotNil } from 'st-utils';

import { mergeMaps } from '../util/merge-maps';
import { ReflectMetadataTypesEnum } from '../util/reflect-metadata-types.enum';

interface ApiPropertyOptions {
  type?: () => any;
  isArray?: boolean;
  example?: () => any;
  optional?: boolean;
  isEnum?: boolean;
}

export interface ApiPropertyMetadata {
  type: () => any;
  isEnum: boolean;
  isArray: boolean;
  example?: () => any;
  optional: boolean;
}

interface ApiProperty {
  (options?: ApiPropertyOptions): PropertyDecorator;
  upsertMetadata(target: any, propertyKey: string, data: ApiPropertyMetadata): void;
  getMetadata(target: any): Map<string, ApiPropertyMetadata> | null;
}

const metadataStore = new Map<any, Map<string, ApiPropertyMetadata>>();

const upsertMetadata: ApiProperty['upsertMetadata'] = (target, propertyKey, data) => {
  const metadata = metadataStore.get(target) ?? new Map<string, ApiPropertyMetadata>();
  metadata.set(propertyKey, data);
  metadataStore.set(target, metadata);
};
const getMetadata: ApiProperty['getMetadata'] = (target) => {
  const prototype = isNotNil(target) && Object.getPrototypeOf(target);
  const parentConstructor = prototype?.constructor;
  const metadata = metadataStore.get(target);
  const parentMetadata = metadataStore.get(parentConstructor);
  const prototypeMetadata = metadataStore.get(prototype);
  const newMap = mergeMaps([parentMetadata, prototypeMetadata, metadata]);
  return newMap.size ? newMap : null;
};

function ApiPropertyInternal(options?: ApiPropertyOptions): PropertyDecorator {
  return (target, propertyKey) => {
    const reflectType = Reflect.getMetadata(
      ReflectMetadataTypesEnum.designType,
      target,
      propertyKey
    );
    upsertMetadata(target.constructor, String(propertyKey), {
      type: options?.type ?? (() => reflectType),
      isArray: !!options?.isArray,
      example: options?.example,
      optional: !!options?.optional,
      isEnum: !!options?.isEnum,
    });
  };
}

export const ApiProperty: ApiProperty = Object.assign(ApiPropertyInternal, {
  upsertMetadata,
  getMetadata,
});
