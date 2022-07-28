import { Injectable } from '../../di/injectable';

import { QueryHistoryRepository } from './query-history.repository';

@Injectable({ global: true })
export class QueryHistoryService {
  constructor(private readonly queryHistoryRepository: QueryHistoryRepository) {}
}
