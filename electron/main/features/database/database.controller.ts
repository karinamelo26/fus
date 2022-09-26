import { StatusCodes } from 'http-status-codes';

import { Controller } from '../../api/controller';
import { Data } from '../../api/data';
import { Method } from '../../api/method';
import { IdNameViewModel } from '../../shared/view-model/id-name.view-model';

import { DatabaseService } from './database.service';
import { AddDto } from './dto/add.dto';
import { GetAllSummaryDto } from './dto/get-all-summary.dto';
import { GetAllDto } from './dto/get-all.dto';
import { GetSummaryDto } from './dto/get-summary.dto';
import { DatabaseAllSummaryViewModel } from './view-model/database-all-summary.view-model';
import { DatabaseSummaryViewModel } from './view-model/database-summary.view-model';
import { DatabaseViewModel } from './view-model/database.view-model';

@Controller('database', { summary: 'All related to the database table' })
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Method('get-all', {
    summary: 'Get all databases',
    responses: [
      { status: StatusCodes.OK, data: () => DatabaseViewModel, isArray: true },
      { status: StatusCodes.NOT_FOUND },
    ],
  })
  async getAll(@Data() dto: GetAllDto): Promise<DatabaseViewModel[]> {
    return this.databaseService.getAll(dto);
  }

  @Method('get-types')
  getTypes(): IdNameViewModel[] {
    return this.databaseService.getTypes();
  }

  @Method('get-summary')
  async getSummary(@Data() dto: GetSummaryDto): Promise<DatabaseSummaryViewModel> {
    return this.databaseService.getSummary(dto);
  }

  @Method('get-all-summary')
  async getAllSummary(
    @Data() dto: GetAllSummaryDto
  ): Promise<DatabaseAllSummaryViewModel> {
    return this.databaseService.getAllSummary(dto);
  }

  @Method('add')
  async add(@Data() dto: AddDto): Promise<DatabaseViewModel> {
    return this.databaseService.add(dto);
  }
}
