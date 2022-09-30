import { ApiProperty } from '../../../api/api-property';

import { DocsMethodViewModel } from './docs-method.view-model';

export class DocsControllerViewModel {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  path!: string;

  @ApiProperty({ optional: true })
  summary?: string;

  @ApiProperty({ type: () => DocsMethodViewModel, isArray: true })
  methods!: DocsMethodViewModel[];
}
