export interface ParameterMetadata {
  index: number;
  type: any;
  optional: boolean;
}

export interface MethodMetadata {
  propertyKey: string;
  path: string;
  parameters: Map<number, ParameterMetadata>;
}

export interface ControllerMetadata {
  target: any;
  path: string;
  methods: Map<string, MethodMetadata>;
}

interface Controller {
  (path: string): ClassDecorator;
  upsertMetadata(target: any, update: (metadata: ControllerMetadata) => ControllerMetadata): void;
  upsertMethodMetadata(target: any, propertyKey: string, update: (metadata: MethodMetadata) => MethodMetadata): void;
  getMetadata(target: any): ControllerMetadata | null;
}

const metadataStore = new Map<any, ControllerMetadata>();

const upsertMetadata: Controller['upsertMetadata'] = (target, update) => {
  const metadata = metadataStore.get(target) ?? { target, path: '', methods: new Map() };
  metadataStore.set(target, update(metadata));
};
const upsertMethodMetadata: Controller['upsertMethodMetadata'] = (target, propertyKey, update) => {
  upsertMetadata(target, metadata => {
    const method = metadata.methods.get(propertyKey) ?? { propertyKey, path: '', parameters: new Map() };
    metadata.methods.set(propertyKey, update(method));
    return metadata;
  });
};
const getMetadata: Controller['getMetadata'] = target => metadataStore.get(target) ?? null;

function ControllerInternal(path: string): ClassDecorator {
  return target => {
    upsertMetadata(target, metadata => ({ ...metadata, path }));
  };
}

export const Controller: Controller = Object.assign(ControllerInternal, {
  upsertMetadata,
  upsertMethodMetadata,
  getMetadata,
});
