import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntityWithoutId {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}

export class BaseEntity extends BaseEntityWithoutId {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
