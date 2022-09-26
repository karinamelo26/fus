import { ApiProperty, ApiPropertyMetadata } from './api-property';

const defaultTypesExamplesMap = new Map()
  .set(Number, 1)
  .set(String, 'string')
  .set(Date, new Date())
  .set(Symbol, 'symbol')
  .set(Boolean, true);

function fromModelToExampleWithoutMetadata(model: any, isArray = false): any {
  const type = defaultTypesExamplesMap.get(model) ?? {};
  return isArray ? [type] : type;
}

function fromModelToExampleWithMetadata(
  metadata: Map<string, ApiPropertyMetadata>,
  isArray = false
): any {
  const example: Record<string, any> = {};
  for (let [property, propertyMetadata] of metadata) {
    const type = propertyMetadata.type();
    if (propertyMetadata.optional) {
      property = `${property}?`;
    }
    example[property] =
      propertyMetadata.example?.() ?? fromModelToExample(type, propertyMetadata.isArray);
  }
  return isArray ? [example] : example;
}

export function fromModelToExample(model: any, isArray = false): any {
  const metadata = ApiProperty.getMetadata(model);
  return metadata
    ? fromModelToExampleWithMetadata(metadata, isArray)
    : fromModelToExampleWithoutMetadata(model, isArray);
}
