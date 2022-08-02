import { PrismaClient } from '@prisma/client';

import { Module } from '../api/module';

@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: () =>
        new PrismaClient({
          log: ['error', 'query', 'info', 'warn'],
        }),
    },
  ],
})
export class PrismaModule {}
