import { OpenAPIV3 } from 'openapi-types';

import { DocsResponseViewModel } from './docs-response.view-model';

export class DocsMethodViewModel {
  path!: string;
  summary?: string;
  description?: string;
  request?: OpenAPIV3.SchemaObject;
  responses!: DocsResponseViewModel[];
}