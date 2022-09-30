import { ApiProperty } from '../../../api/api-property';

import { DocsResponseViewModel } from './docs-response.view-model';

export class DocsMethodViewModel {
  @ApiProperty()
  controllerPath!: string;

  @ApiProperty()
  path!: string;

  @ApiProperty({ optional: true })
  summary?: string;

  @ApiProperty({ optional: true })
  description?: string;

  @ApiProperty({ optional: true })
  request?: any;

  @ApiProperty({ type: () => DocsResponseViewModel, isArray: true })
  responses!: DocsResponseViewModel[];
}
