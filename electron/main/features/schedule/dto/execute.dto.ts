import { IsDefined, IsUUID } from 'class-validator';

export class ExecuteDto {
  @IsDefined()
  @IsUUID()
  idSchedule!: string;
}
