import { Class } from 'type-fest';

import { Provider } from '../di/provider';

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
const getMetadata: Module['getMetadata'] = (target) => metadataStore.get(target) ?? null;

function ModuleInternal(options: ModuleOptions): ClassDecorator {
  return (target) => {
    setMetadata(target, options);
  };
}

export const Module: Module = Object.assign(ModuleInternal, { setMetadata, getMetadata });
