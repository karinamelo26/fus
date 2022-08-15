import { QueryHistoryCodeEnum } from '../query-history/query-history-code.enum';

export class SchedulerError extends Error {
  constructor(public readonly code: QueryHistoryCodeEnum, message?: string) {
    super(message);
  }
}
