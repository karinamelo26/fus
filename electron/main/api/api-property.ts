import { ReflectMetadataTypesEnum } from '../util/reflect-metadata-types.enum';

interface ApiPropertyOptions {
  type?: () => any;
  isArray?: boolean;
  example?: () => any;
  optional?: boolean;
}

export interface ApiPropertyMetadata {
  type: () => any;
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
const getMetadata: ApiProperty['getMetadata'] = (target) =>
  metadataStore.get(target) ?? null;

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
    });
  };
}

export const ApiProperty: ApiProperty = Object.assign(ApiPropertyInternal, {
  upsertMetadata,
  getMetadata,
});
