import { DocsResponseViewModel } from './docs-response.view-model';

export class DocsMethodViewModel {
  controllerPath!: string;
  path!: string;
  summary?: string;
  description?: string;
  request?: any;
  responses!: DocsResponseViewModel[];
}
