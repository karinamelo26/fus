import { IsBoolean, IsOptional } from 'class-validator';

export class GetAllDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
