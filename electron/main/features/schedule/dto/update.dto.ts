import { IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { ApiProperty } from '../../../api/api-property';

export class UpdateDto {
  @ApiProperty()
  @IsDefined()
  @IsUUID()
  idSchedule!: string;

  @ApiProperty({ optional: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ optional: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  query?: string;
}
