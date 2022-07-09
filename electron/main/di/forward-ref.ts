export class ForwardRef {
  constructor(public readonly providerFn: () => any) {}
}

export function forwardRef(providerFn: () => any): ForwardRef {
  return new ForwardRef(providerFn);
}

export function isForwardRef(value: any): value is ForwardRef {
  return value instanceof ForwardRef;
}
