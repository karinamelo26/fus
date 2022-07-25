import { DataSourceOptions } from 'typeorm';

export type TypeORMModuleOptions = DataSourceOptions & {
  autoLoadEntities?: boolean;
};
