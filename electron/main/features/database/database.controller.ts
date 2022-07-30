import { Controller } from '../../api/controller';
import { Data } from '../../api/data';
import { Method } from '../../api/method';

import { DatabaseService } from './database.service';
import { GetAllDto } from './dto/get-all.dto';
import { DatabaseViewModel } from './view-model/database.view-model';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Method('get-all')
  async getAll(@Data() dto: GetAllDto): Promise<DatabaseViewModel[]> {
    return this.databaseService.getAll(dto);
  }
}
