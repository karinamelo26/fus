import { Module } from './api/module';
import { DatabaseModule } from './features/database/database.module';
import { TypeORMConfig } from './typeorm/typeorm-config';
import { TypeORMModule } from './typeorm/typeorm.module';

@Module({
  imports: [TypeORMModule.forRoot(TypeORMConfig), DatabaseModule],
})
export class ApiModule {}
