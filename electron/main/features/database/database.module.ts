import { Module } from '../../api/module';

import { DatabaseController } from './database.controller';

@Module({
  controllers: [DatabaseController],
})
export class DatabaseModule {}
