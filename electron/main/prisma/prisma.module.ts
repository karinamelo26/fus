import { PrismaClient } from '@prisma/client';

import { Module } from '../api/module';

@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: () => new PrismaClient(),
    },
  ],
})
export class PrismaModule {}
