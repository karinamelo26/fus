import { Module } from '../../api/module';

import { DocsController } from './docs.controller';

@Module({
  controllers: [DocsController],
})
export class DocsModule {}
