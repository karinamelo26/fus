import { Class } from 'type-fest';

import { isClass } from '../util/util';

class ProviderBase {
  constructor(public readonly provide: any) {}
}

export class ClassProvider extends ProviderBase {
  constructor(provide: any, public readonly useClass: Class<any>) {
    super(provide);
  }
}

export class FactoryProvider<T = any> extends ProviderBase {
  constructor(
    provide: any,
    public readonly useFactory: (...args: any[]) => T | Promise<T>,
    public readonly deps?: any[]
  ) {
    super(provide);
  }
}

export class ValueProvider<T = any> extends ProviderBase {
  constructor(provide: any, public readonly useValue: T) {
    super(provide);
  }
}

export type Provider = ClassProvider | FactoryProvider | ValueProvider;

export function isProvider(value: any): value is Provider {
  return value instanceof ValueProvider || value instanceof ClassProvider || value instanceof FactoryProvider;
}

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
