import { Repository } from 'typeorm';

import { EntityRepository } from '../../di/entity-repository';

import { DatabaseEntity } from './database.entity';

@EntityRepository(DatabaseEntity)
export class DatabaseRepository extends Repository<DatabaseEntity> {}
