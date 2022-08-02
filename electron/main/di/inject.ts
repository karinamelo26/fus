import { isForwardRef } from './forward-ref';

export interface InjectMetadata {
  typeFn: () => any;
}

interface Inject {
  (value: any): ParameterDecorator;
  setMetadata(target: any, index: number, metadata: InjectMetadata): void;
  getAllForTarget(target: any): (InjectMetadata | undefined)[];
}

const MapParameter = Map<number, InjectMetadata>;
const metadataStore = new Map<any, Map<number, InjectMetadata>>();

const setMetadata: Inject['setMetadata'] = (target, index, metadata) => {
  let classStored = metadataStore.get(target);
  if (!classStored) {
    classStored = new MapParameter();
    metadataStore.set(target, classStored);
  }
  classStored.set(index, metadata);
};
const getAllForTarget: Inject['getAllForTarget'] = target => {
  const classStored = metadataStore.get(target) ?? new MapParameter();
  const array: (InjectMetadata | undefined)[] = [];
  for (const [index, metadata] of classStored) {
    array[index] = metadata;
  }
  return array;
};

function InjectInternal(providerOrForwardRef: any): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    setMetadata(target, parameterIndex, {
      typeFn: isForwardRef(providerOrForwardRef) ? providerOrForwardRef.providerFn : () => providerOrForwardRef,
    });
  };
}

export const Inject: Inject = Object.assign(InjectInternal, { setMetadata, getAllForTarget });
