import { IsDefined, IsUUID } from 'class-validator';

export class ConnectionStatusDto {
  @IsUUID()
  @IsDefined()
  idDatabase!: string;
}
