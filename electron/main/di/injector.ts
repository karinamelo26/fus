import { isFunction } from 'st-utils';
import { Class } from 'type-fest';

import { ReflectMetadataTypes } from '../util/reflect';

import { Inject } from './inject';
import { Injectable } from './injectable';
import { ClassProvider, FactoryProvider, Provider, ValueProvider } from './provider';

function stringifyTarget(target: any): string {
  return isFunction(target) ? target.name : `${target}`;
}

export class Injector {
  constructor() {
    this._instances.set(Injector, this);
  }

  private readonly _providers = new Map<any, Provider>();
  private readonly _futureInstances = new Map<any, Promise<any>>();
  private readonly _instances = new Map<any, any>();

  private _resolveValueProvider<T>(provider: ValueProvider): T {
    this._instances.set(provider.provide, provider.useValue);
    return provider.useValue;
  }

  private async _resolveClassProvider<T>(provider: ClassProvider): Promise<T> {
    const injectParams = Inject.getAllForTarget(provider.useClass);
    const reflectParams: Class<any>[] = Reflect.getMetadata(ReflectMetadataTypes.paramTypes, provider.useClass) ?? [];
    const params = reflectParams.map((param, index) => injectParams[index]?.typeFn() ?? param);
    if (!params.length) {
      const instance = new provider.useClass();
      this._instances.set(provider.provide, instance);
      return instance;
    }
    const injections: any[] = [];
    for (const param of params) {
      injections.push(await this.resolve(param));
    }
    const instance = new provider.useClass(...injections);
    this._instances.set(provider.provide, instance);
    return instance;
  }

  private async _resolveFactoryProvider<T>(provider: FactoryProvider): Promise<T> {
    const deps: any[] = [];
    for (const dep of provider.deps ?? []) {
      deps.push(await this.resolve(dep));
    }
    const instance = await Promise.resolve(provider.useFactory(...deps));
    this._instances.set(provider.provide, instance);
    return instance;
  }

  private async _resolveProvider<T>(provider: Provider): Promise<T> {
    if (provider instanceof ValueProvider) {
      return this._resolveValueProvider(provider);
    }
    if (provider instanceof ClassProvider) {
      return this._resolveClassProvider(provider);
    }
    return this._resolveFactoryProvider(provider);
  }

  async resolve<T>(target: any): Promise<T> {
    if (this._instances.has(target)) {
      return this._instances.get(target)!;
    }
    if (this._futureInstances.has(target)) {
      return await this._futureInstances.get(target)!;
    }
    const provider = this._providers.get(target);
    if (!provider) {
      throw new Error(`"${stringifyTarget(target)}" is not provided globally nor is provided by the providers`);
    }
    return this._resolveProvider(provider);
  }

  addProvider(provider: Provider): this {
    this._providers.set(provider.provide, provider);
    return this;
  }

  addProviders(providers: Provider[]): this {
    for (const provider of providers) {
      this.addProvider(provider);
    }
    return this;
  }

  get<T>(target: Class<T>): T;
  get<T>(target: any): T;
  get<T>(target: any): T {
    const instance = this._instances.get(target);
    if (!instance) {
      throw new Error(
        `Instance "${stringifyTarget(
          target
        )}" not found. Ensure it's a global Injectable or is declare in the providers array`
      );
    }
    return instance;
  }

  async resolveAll(): Promise<this> {
    const injectableEntries = Injectable.getAll().filter(([, options]) => options.global);
    for (const [target] of injectableEntries) {
      this._providers.set(target, new ClassProvider(target, target));
    }
    const providers = [...this._providers.values()];
    for (const provider of providers) {
      await this._resolveProvider(provider);
    }
    return this;
  }
}

export const injector = new Injector();
