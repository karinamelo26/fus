import { DatabaseConnectionStatusEnum } from './database-connection-status.enum';

export class DatabaseConnectionStatusViewModel {
  status!: DatabaseConnectionStatusEnum;
  message?: string;
}
