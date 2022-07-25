import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '../../shared/base-entity';
import { ScheduleEntity } from '../schedule/schedule.entity';

import { DatabaseTypeEnum } from './database-type.enum';

@Entity()
export class DatabaseEntity extends BaseEntity {
  @Column({ length: 50 })
  name!: string;

  @Column({ length: 100 })
  host!: string;

  @Column()
  port!: number;

  @Column({ length: 255 })
  username!: string;

  @Column({ length: 500 })
  password!: string;

  @Column({ length: 255 })
  database!: string;

  @Column({ type: 'simple-enum', enum: DatabaseTypeEnum })
  type!: DatabaseTypeEnum;

  @OneToMany(() => ScheduleEntity, schedule => schedule.idDatabase)
  schedules?: ScheduleEntity[];
}
