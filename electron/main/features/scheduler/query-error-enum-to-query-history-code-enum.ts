import { QueryHistoryCodeEnum } from '../query-history/query-history-code.enum';

import { QueryErrorEnum } from './query-error.enum';

export function queryErrorEnumToQueryHistoryCodeEnum(code: QueryErrorEnum): QueryHistoryCodeEnum {
  const mapObject: Record<QueryErrorEnum, QueryHistoryCodeEnum> = {
    [QueryErrorEnum.ConnectionError]: QueryHistoryCodeEnum.DatabaseNotAvailable,
    [QueryErrorEnum.QueryError]: QueryHistoryCodeEnum.QueryError,
    [QueryErrorEnum.Timeout]: QueryHistoryCodeEnum.Timeout,
    [QueryErrorEnum.Unknown]: QueryHistoryCodeEnum.Unknown,
  };
  return mapObject[code];
}
