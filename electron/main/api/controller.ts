import { StatusCodes } from 'http-status-codes';

export interface ParameterMetadata {
  index: number;
  type: any;
  optional: boolean;
  isArray: boolean;
}

export interface MethodMetadata {
  propertyKey: string;
  path: string;
  parameters: Array<ParameterMetadata | undefined>;
  code: StatusCodes;
  summary?: string;
  description?: string;
  responses?: MethodMetadataResponse[];
}

export interface MethodMetadataResponse {
  status: StatusCodes;
  data?: () => any;
  isArray: boolean;
  example?: () => any;
}

export interface ControllerMetadata {
  target: any;
  path: string;
  methods: Map<string, MethodMetadata>;
  summary?: string;
}

interface ControllerOptions {
  summary?: string;
}

interface Controller {
  (path: string, options?: ControllerOptions): ClassDecorator;
  upsertMetadata(
    target: any,
    update: (metadata: ControllerMetadata) => ControllerMetadata
  ): void;
  upsertMethodMetadata(
    target: any,
    propertyKey: string,
    update: (metadata: MethodMetadata) => MethodMetadata
  ): void;
  getMetadata(target: any): ControllerMetadata | null;
}

const metadataStore = new Map<any, ControllerMetadata>();

const upsertMetadata: Controller['upsertMetadata'] = (target, update) => {
  const metadata = metadataStore.get(target) ?? { target, path: '', methods: new Map() };
  metadataStore.set(target, update(metadata));
};
const upsertMethodMetadata: Controller['upsertMethodMetadata'] = (
  target,
  propertyKey,
  update
) => {
  upsertMetadata(target, (metadata) => {
    const method = metadata.methods.get(propertyKey) ?? {
      propertyKey,
      path: '',
      parameters: [],
      code: StatusCodes.OK,
    };
    metadata.methods.set(propertyKey, update(method));
    return metadata;
  });
};
const getMetadata: Controller['getMetadata'] = (target) =>
  metadataStore.get(target) ?? null;

function ControllerInternal(path: string, options?: ControllerOptions): ClassDecorator {
  return (target) => {
    upsertMetadata(target, (metadata) => ({
      ...metadata,
      path,
      summary: options?.summary,
    }));
  };
}

export const Controller: Controller = Object.assign(ControllerInternal, {
  upsertMetadata,
  upsertMethodMetadata,
  getMetadata,
});
