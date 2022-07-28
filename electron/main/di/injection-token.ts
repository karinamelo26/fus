export class InjectionToken<T> {
  constructor(public readonly provider?: { useFactory: (...args: any[]) => T; deps?: any[] }) {}
}
