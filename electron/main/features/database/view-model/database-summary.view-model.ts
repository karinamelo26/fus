import { ApiProperty } from '../../../api/api-property';

import { DatabaseAllSummaryViewModel } from './database-all-summary.view-model';

export class DatabaseSummaryViewModel extends DatabaseAllSummaryViewModel {
  @ApiProperty()
  idDatabase!: string;

  @ApiProperty()
  databaseName!: string;
}
