import { StatusCodes } from 'http-status-codes';
import { OpenAPIV3 } from 'openapi-types';

export class DocsResponseViewModel {
  status!: StatusCodes;
  schema?: OpenAPIV3.SchemaObject;
}
