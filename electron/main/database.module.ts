import { Class } from 'type-fest';
import { DataSource, DataSourceOptions, Repository } from 'typeorm';
// TODO check this imports
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';

import { Module } from './api/module';
import { ModuleWithProviders } from './api/module-with-providers';
import { EntityRepository } from './di/entity-repository';

type DatabaseModuleOptions = DataSourceOptions & {
  repositories?: Class<Repository<any>, [EntityTarget<any>, EntityManager, QueryRunner?]>[];
  autoLoadEntities?: boolean;
};

@Module({})
export class DatabaseModule {
  // TODO add forChild method
  static forRoot(options: DatabaseModuleOptions): ModuleWithProviders {
    return new ModuleWithProviders(DatabaseModule, [
      {
        provide: DataSource,
        useFactory: () => {
          let newOptions = options;
          if (newOptions.autoLoadEntities) {
            const entities = EntityRepository.getAll();
            newOptions = { ...newOptions, entities };
          }
          return new DataSource(newOptions).initialize();
        },
      },
      ...(options.repositories ?? []).map(repository => ({
        provide: repository,
        useFactory: (dataSource: DataSource) => {
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
      })),
    ]);
  }
}
