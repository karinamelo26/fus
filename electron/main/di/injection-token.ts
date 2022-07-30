import { FactoryProvider } from './provider';

export class InjectionToken<T> {
  constructor(public readonly provider?: Omit<FactoryProvider<T>, 'provide'>) {}
}
