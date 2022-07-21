import { Repository } from 'typeorm';

import { EntityRepository } from '../../di/entity-repository';

import { SchedulerEntity } from './scheduler.entity';

@EntityRepository(SchedulerEntity)
export class SchedulerRepository extends Repository<SchedulerEntity> {}
