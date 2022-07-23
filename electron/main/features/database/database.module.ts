import { Module } from '../../api/module';
import { TypeORMModule } from '../../typeorm.module';

import { DatabaseController } from './database.controller';
import { DatabaseRepository } from './database.repository';

@Module({
  imports: [TypeORMModule.forChild([DatabaseRepository])],
  controllers: [DatabaseController],
})
export class DatabaseModule {}
