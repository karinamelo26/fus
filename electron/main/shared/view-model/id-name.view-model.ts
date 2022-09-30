import { ApiProperty } from '../../api/api-property';

export class IdNameViewModel {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}
