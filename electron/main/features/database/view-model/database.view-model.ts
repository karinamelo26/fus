import { AutoMap } from '@automapper/classes';

export class DatabaseViewModel {
  @AutoMap() idDatabase!: string;
  @AutoMap() active!: boolean;
  @AutoMap() name!: string;
  @AutoMap() host!: string;
  @AutoMap() scheduleCount!: number;
  @AutoMap() createdAt!: Date;
}
