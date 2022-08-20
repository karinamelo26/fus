import { homedir } from 'os';
import { join } from 'path';

import { Prisma, PrismaClient } from '@prisma/client';
import { app } from 'electron';

import { Module } from '../api/module';
import { Logger } from '../logger/logger';
import { formatPerformanceTime } from '../util/format-performance-time';

@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: () => {
        const prismaClient = new PrismaClient({
          log: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            // TODO add more logging
          ],
          datasources: {
            db: {
              url: `file:${join(homedir(), '.fus', 'database', 'data.sqlite')}`,
            },
          },
        });
        if (!app.isPackaged) {
          const logger = Logger.create(PrismaClient);
          prismaClient.$on('query', (event: Prisma.QueryEvent) => {
            logger.log(`Query: ${event.query}\nParams:`, event.params, ...formatPerformanceTime(event.duration));
          });
        }
        return prismaClient;
      },
    },
  ],
})
export class PrismaModule {}
