import { PrismaClient } from '@prisma/client';
import { Class } from 'type-fest';

import { Injectable, InjectableOptions } from './injectable';

const repositorySymbol = Symbol('repository');

export function createRepository<K extends keyof PrismaClient>(repository: K): Class<PrismaClient[K]> {
  class CustomRepository {
    static readonly [repositorySymbol] = repository;
  }
  return CustomRepository as any;
}

export function Repository(options?: Pick<InjectableOptions, 'global'>): ClassDecorator {
  return (target) => {
    Injectable({
      global: options?.global,
      deps: [PrismaClient],
      useFactory: (prismaClient: PrismaClient) => {
        const key: keyof PrismaClient = (target as any)[repositorySymbol];
        return prismaClient[key];
      },
    })(target);
  };
}
