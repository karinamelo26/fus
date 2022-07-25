import { Repository } from 'typeorm';

import { EntityRepository } from '../../di/entity-repository';

import { ScheduleEntity } from './schedule.entity';

@EntityRepository(ScheduleEntity)
export class ScheduleRepository extends Repository<ScheduleEntity> {}
