import { QueryHistory } from '@prisma/client';
import { round, sumBy } from 'st-utils';

import { QueryHistoryCodeEnum } from '../query-history/query-history-code.enum';

import { DatabaseAllSummaryViewModel } from './view-model/database-all-summary.view-model';

export function generateMetricsQueriesHistory(
  queriesHistory: QueryHistory[]
): Pick<DatabaseAllSummaryViewModel, 'averageQueryRuntime' | 'successRate' | 'runCount'> {
  const queriesHistorySuccess = queriesHistory.filter(
    (queryHistory) => queryHistory.code === QueryHistoryCodeEnum.Success
  );
  return {
    runCount: queriesHistory.length,
    successRate: queriesHistory.length ? round((queriesHistorySuccess.length / queriesHistory.length) * 100) : 0,
    averageQueryRuntime: queriesHistorySuccess.length
      ? round(sumBy(queriesHistorySuccess, 'queryTime') / queriesHistorySuccess.length)
      : 0,
  };
}
