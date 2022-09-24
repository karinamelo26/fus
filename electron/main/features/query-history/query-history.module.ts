import { Module } from '../../api/module';

import { QueryHistoryController } from './query-history.controller';

@Module({
  controllers: [QueryHistoryController],
})
export class QueryHistoryModule {}
