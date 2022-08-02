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

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Method('get-all')
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
  async getAllSummary(@Data() dto: GetAllSummaryDto): Promise<DatabaseAllSummaryViewModel> {
    return this.databaseService.getAllSummary(dto);
  }

  @Method('add')
  async add(@Data() dto: AddDto): Promise<DatabaseViewModel> {
    return this.databaseService.add(dto);
  }
}
