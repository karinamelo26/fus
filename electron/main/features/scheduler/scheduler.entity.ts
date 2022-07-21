import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SchedulerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
