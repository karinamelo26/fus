import { StatusCodes } from 'http-status-codes';

export class DocsResponseViewModel {
  status!: StatusCodes;
  statusMessage!: string;
  example?: any;
}
