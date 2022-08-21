import { IdNameViewModel } from './view-model/id-name.view-model';

export function fromEnumToIdName(value: Record<any, any>): IdNameViewModel[] {
  const values = Object.values(value);
  const names = values.slice(0, values.length / 2) as string[];
  const ids = values.slice(values.length / 2) as number[];
  return ids.map((id, index) => ({ id, name: names[index] }));
}
