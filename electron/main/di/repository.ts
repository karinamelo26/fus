import { PrismaClient } from '@prisma/client';
import { Class } from 'type-fest';

import { Injectable } from './injectable';

const repositorySymbol = Symbol('repository');

export function createRepository<K extends keyof PrismaClient>(repository: K): Class<PrismaClient[K]> {
  class CustomRepository {
    static readonly [repositorySymbol] = repository;
  }
  return CustomRepository as any;
}

export function Repository(): ClassDecorator {
  return target => {
    Injectable({
      global: true,
      deps: [PrismaClient],
      useFactory: (prismaClient: PrismaClient) => {
        const key: keyof PrismaClient = (target as any)[repositorySymbol];
        return prismaClient[key];
      },
    })(target);
  };
}
