import { homedir } from 'os';
import { join } from 'path';

import { PrismaClient } from '@prisma/client';
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
            { emit: 'event', level: 'info' },
            { emit: 'event', level: 'warn' },
          ],
          datasources: {
            db: {
              url: `file:${join(homedir(), '.fus', 'database', 'data.sqlite')}`,
            },
          },
        });
        if (!app.isPackaged) {
          const logger = Logger.create(PrismaClient);
          prismaClient.$on('query', event => {
            logger.log(`Query: ${event.query}\nParams:`, event.params, ...formatPerformanceTime(event.duration));
          });
          prismaClient.$on('error', event => {
            logger.error(event.message);
          });
          prismaClient.$on('info', event => {
            logger.log(event.message);
          });
          prismaClient.$on('warn', event => {
            logger.log(event.message);
          });
        }
        return prismaClient;
      },
    },
  ],
})
export class PrismaModule {}
