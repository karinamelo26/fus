import { Module } from './api/module';
import { DatabaseModule } from './features/database/database.module';
import { DocsModule } from './features/docs/docs.module';
import { QueryHistoryModule } from './features/query-history/query-history.module';
import { ScheduleModule } from './features/schedule/schedule.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, DatabaseModule, ScheduleModule, DocsModule, QueryHistoryModule],
})
export class ApiModule {}
