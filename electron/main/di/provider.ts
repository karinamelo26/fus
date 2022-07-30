import { Class } from 'type-fest';

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
