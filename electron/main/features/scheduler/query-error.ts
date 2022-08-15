import { QueryErrorEnum } from './query-error.enum';

export class QueryError extends Error {
  constructor(public readonly code: QueryErrorEnum, message?: string) {
    super(message);
  }
}
