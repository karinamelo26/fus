import { IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateDto {
  @IsDefined()
  @IsUUID()
  idSchedule!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  query?: string;
}
