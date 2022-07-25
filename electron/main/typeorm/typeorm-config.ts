import { homedir } from 'os';
import { join } from 'path';

import { InjectionToken } from '../di/injection-token';

import { NamingStrategy } from './naming-strategy';
import { TypeORMModuleOptions } from './typeorm-module-options';

export const TypeORMConfig = new InjectionToken<TypeORMModuleOptions>({
  useFactory: () => ({
    autoLoadEntities: true,
    type: 'sqlite',
    database: join(homedir(), '.fus', 'database', 'data.sqlite'),
    synchronize: true,
    logging: 'all',
    dropSchema: false,
    extra: {},
    namingStrategy: new NamingStrategy(),
  }),
});
