import { IsDefined, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class GetSummaryDto {
  @IsDefined()
  @IsUUID()
  idDatabase!: string;

  @IsDefined()
  @IsNumber()
  @IsPositive()
  daysPrior!: number;
}
