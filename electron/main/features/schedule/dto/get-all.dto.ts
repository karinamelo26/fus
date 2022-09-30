import { IsBoolean, IsOptional } from 'class-validator';

import { ApiProperty } from '../../../api/api-property';

export class GetAllDto {
  @ApiProperty({ optional: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
