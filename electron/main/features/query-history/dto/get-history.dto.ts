import { IsDefined, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class GetHistoryDto {
  @IsOptional()
  @IsUUID()
  idDatabase?: string;

  @IsOptional()
  @IsUUID()
  idSchedule?: string;

  @IsDefined()
  @IsNumber()
  @IsPositive()
  daysPrior!: number;
}
