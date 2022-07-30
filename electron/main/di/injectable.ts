import { FactoryProvider } from './provider';

export type InjectableOptions = { global?: boolean } & Partial<Omit<FactoryProvider, 'provide'>>;

interface Injectable {
  (options?: InjectableOptions): ClassDecorator;
  getMetadata(target: any): InjectableOptions | null;
  setMetadata(target: any, metadata: InjectableOptions): void;
  getAll(): [any, InjectableOptions][];
}

const metadataStore = new Map<any, InjectableOptions>();

const getMetadata: Injectable['getMetadata'] = target => metadataStore.get(target) ?? null;
const setMetadata: Injectable['setMetadata'] = (target, metadata) => metadataStore.set(target, metadata);
const getAll: Injectable['getAll'] = () => [...metadataStore];

function InjectableInternal(options?: InjectableOptions): ClassDecorator {
  return target => {
    setMetadata(target, options ?? {});
  };
}

export const Injectable: Injectable = Object.assign(InjectableInternal, { getMetadata, setMetadata, getAll });
