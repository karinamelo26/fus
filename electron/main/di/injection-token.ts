import { resolveProvider } from '../api/module';

import { injector } from './injector';

export class InjectionToken<T> {
  constructor(public readonly provider?: { useFactory: (...args: any[]) => T; deps?: any[] }) {
    if (provider) {
      injector.addProvider(resolveProvider({ ...provider, provide: this }));
    }
  }
}
