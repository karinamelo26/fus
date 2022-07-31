import { AutoMap } from '@automapper/classes';

export class DatabaseAllSummaryViewModel {
  @AutoMap() successRate!: number;
  @AutoMap() runCount!: number;
  @AutoMap() scheduleActiveCount!: number;
  @AutoMap() scheduleInactiveCount!: number;
  @AutoMap() averageQueryRuntime!: number;
}
