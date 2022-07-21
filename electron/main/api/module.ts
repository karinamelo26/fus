import { Class } from 'type-fest';

import { ClassProvider, FactoryProvider, isProvider, Provider, ValueProvider } from '../di/provider';
import { isClass } from '../util/util';

import { ModuleWithProviders } from './module-with-providers';

export interface ModuleOptions {
  imports?: Array<Class<any> | ModuleWithProviders>;
  providers?: Array<Class<any> | Provider>;
  controllers?: Array<Class<any>>;
}

interface Module {
  (options: ModuleOptions): ClassDecorator;
  setMetadata(target: any, options: ModuleOptions): void;
  getMetadata(target: any): ModuleOptions | null;
}

const metadataStore = new Map<any, ModuleOptions>();

const setMetadata: Module['setMetadata'] = (target, options) => {
  metadataStore.set(target, options);
};
const getMetadata: Module['getMetadata'] = target => metadataStore.get(target) ?? null;

export function resolveProvider(possibleProvider: Provider | Class<any>): Provider {
  if (isProvider(possibleProvider)) {
    return possibleProvider;
  }
  if (isClass(possibleProvider)) {
    return new ClassProvider(possibleProvider, possibleProvider);
  }
  const providerObject: Partial<ValueProvider & ClassProvider & FactoryProvider> = possibleProvider;
  if (providerObject.useValue) {
    return new ValueProvider(providerObject.provide, providerObject.useValue);
  }
  if (providerObject.useClass) {
    return new ClassProvider(providerObject.provide, providerObject.useClass);
  }
  if (providerObject.useFactory) {
    return new FactoryProvider(providerObject.provide, providerObject.useFactory, providerObject.deps);
  }
  throw new Error(`Provider ${JSON.stringify(providerObject)} is not correct`);
}

function ModuleInternal(options: ModuleOptions): ClassDecorator {
  return target => {
    if (options.providers?.length) {
      options = { ...options, providers: [...options.providers].map(resolveProvider) };
    }
    setMetadata(target, options);
  };
}

export const Module: Module = Object.assign(ModuleInternal, { setMetadata, getMetadata });
