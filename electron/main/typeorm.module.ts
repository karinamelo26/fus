import { performance } from 'perf_hooks';

import { Class } from 'type-fest';
import { DataSource, DataSourceOptions, EntityManager, EntityTarget, QueryRunner, Repository } from 'typeorm';

import { Module } from './api/module';
import { ModuleWithProviders } from './api/module-with-providers';
import { EntityRepository } from './di/entity-repository';
import { FactoryProvider } from './di/provider';
import { Logger } from './logger/logger';
import { formatPerformanceTime } from './util/format-performance-time';

type TypeORMModuleOptions = DataSourceOptions & {
  repositories?: Class<Repository<any>, [EntityTarget<any>, EntityManager, QueryRunner?]>[];
  autoLoadEntities?: boolean;
};

function createProvider(repository: Class<Repository<any>>): FactoryProvider {
  return new FactoryProvider(
    repository,
    (dataSource: DataSource) => {
      const entity = EntityRepository.getMetadata(repository);
      if (!entity) {
        throw new Error(
          `Entity not found for repository "${repository.name}". Did you forget to include @EntityRepository?`
        );
      }
      const repositoryInstance = dataSource.getRepository(entity);
      const customRepository = new repository(
        repositoryInstance.target,
        repositoryInstance.manager,
        repositoryInstance.queryRunner
      );
      return repositoryInstance.extend(customRepository);
    },
    [DataSource]
  );
}

@Module({})
export class TypeORMModule {
  private static readonly _logger = Logger.create('DatabaseModule');

  static forRoot(options: TypeORMModuleOptions): ModuleWithProviders {
    return new ModuleWithProviders(TypeORMModule, [
      {
        provide: DataSource,
        useFactory: async () => {
          const startMs = performance.now();
          this._logger.log('Establishing connection');
          let newOptions = options;
          if (newOptions.autoLoadEntities) {
            const entities = EntityRepository.getAll();
            newOptions = { ...newOptions, entities };
          }
          const dataSource = await new DataSource(newOptions).initialize();
          const endMs = performance.now();
          this._logger.log('Connection established', ...formatPerformanceTime(startMs, endMs));
          return dataSource;
        },
      },
      ...(options.repositories ?? []).map(createProvider),
    ]);
  }

  static forChild(repositories: Class<Repository<any>>[]): ModuleWithProviders {
    return new ModuleWithProviders(TypeORMModule, repositories.map(createProvider));
  }
}
