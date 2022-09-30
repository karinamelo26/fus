import { StatusCodes } from 'http-status-codes';

import { ApiProperty } from '../../../api/api-property';

export class DocsResponseViewModel {
  @ApiProperty({ isEnum: true, type: () => StatusCodes })
  status!: StatusCodes;

  @ApiProperty()
  statusMessage!: string;

  @ApiProperty({ optional: true })
  example?: any;
}
