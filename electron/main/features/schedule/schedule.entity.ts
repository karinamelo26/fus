import { Check, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../shared/base-entity';
import { DatabaseEntity } from '../database/database.entity';

import { FrequencyDayType } from './frequency-day.type';
import { HourType } from './hour.type';
import { MonthDayType } from './month-day.type';
import { MonthType } from './month.type';
import { WeekDayType } from './week-day.type';

@Entity()
@Check('weekDay >= 1 AND weekDay <= 7')
@Check('month >= 1 AND month <= 12')
@Check('monthDay >= 1 AND monthDay <= 31')
@Check('frequencyDay >= 1 AND frequencyDay <= 12')
@Check('hour >= 0 AND hour <= 23')
export class ScheduleEntity extends BaseEntity {
  @Column({ length: 300 })
  description!: string;

  @Column()
  idDatabase!: string;

  @ManyToOne(() => DatabaseEntity, database => database.schedules)
  @JoinColumn()
  database?: DatabaseEntity;

  @Column()
  query!: string;

  @Column({ type: 'int', nullable: true })
  weekDay?: WeekDayType;

  @Column({ type: 'int', nullable: true })
  month?: MonthType;

  @Column({ type: 'int', nullable: true })
  monthDay?: MonthDayType;

  @Column({ type: 'int', nullable: true })
  frequencyDay?: FrequencyDayType;

  @Column({ type: 'int', nullable: true })
  hour?: HourType;

  @Column({ default: 30_000 })
  timeout!: number;
}
