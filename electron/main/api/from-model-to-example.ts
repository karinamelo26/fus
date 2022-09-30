import { ApiProperty, ApiPropertyMetadata } from './api-property';

const defaultTypesExamplesMap = new Map()
  .set(Number, 1)
  .set(String, 'string')
  .set(Date, new Date())
  .set(Symbol, 'symbol')
  .set(Boolean, true);

interface FromModelOptions {
  isArray?: boolean;
  isEnum?: boolean;
}

function getFirstItemFromEnum(type: any): any {
  const values = Object.values(type);
  const halfValues = values.slice(Math.ceil(values.length / 2));
  return halfValues[0];
}

function fromModelToExampleWithoutMetadata(
  model: any,
  { isEnum, isArray }: FromModelOptions
): any {
  const type = isEnum
    ? getFirstItemFromEnum(model)
    : defaultTypesExamplesMap.get(model) ?? {};
  return isArray ? [type] : type;
}

function fromModelToExampleWithMetadata(
  metadata: Map<string, ApiPropertyMetadata>,
  { isArray }: FromModelOptions
): any {
  const example: Record<string, any> = {};
  for (let [property, propertyMetadata] of metadata) {
    const type = propertyMetadata.type();
    if (propertyMetadata.optional) {
      property = `${property}?`;
    }
    example[property] = propertyMetadata.example
      ? propertyMetadata.example()
      : fromModelToExample(type, {
          isArray: propertyMetadata.isArray,
          isEnum: propertyMetadata.isEnum,
        });
  }
  return isArray ? [example] : example;
}

export function fromModelToExample(model: any, options: FromModelOptions): any {
  const metadata = ApiProperty.getMetadata(model);
  return metadata
    ? fromModelToExampleWithMetadata(metadata, options)
    : fromModelToExampleWithoutMetadata(model, options);
}
