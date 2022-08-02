import { AutoMap } from '@automapper/classes';

export class IdNameViewModel {
  @AutoMap() id!: number;
  @AutoMap() name!: string;
}
