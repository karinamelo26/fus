import { IsDefined, IsNumber, IsPositive } from 'class-validator';

export class GetAllSummaryDto {
  @IsDefined()
  @IsNumber()
  @IsPositive()
  daysPrior!: number;
}
