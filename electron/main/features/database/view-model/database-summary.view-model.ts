import { AutoMap } from '@automapper/classes';

import { DatabaseAllSummaryViewModel } from './database-all-summary.view-model';

export class DatabaseSummaryViewModel extends DatabaseAllSummaryViewModel {
  @AutoMap() idDatabase!: string;
  @AutoMap() databaseName!: string;
}
