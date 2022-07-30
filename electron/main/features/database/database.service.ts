import { Injectable } from '../../di/injectable';
import { fromEnumToIdName } from '../../shared/from-enum-to-id-name';
import { IdNameViewModel } from '../../shared/view-model/id-name.view-model';

import { DatabaseTypeEnum } from './database-type.enum';
import { DatabaseRepository } from './database.repository';
import { GetAllDto } from './dto/get-all.dto';
import { DatabaseViewModel } from './view-model/database.view-model';

@Injectable({ global: true })
export class DatabaseService {
  constructor(private readonly databaseRepository: DatabaseRepository) {}

  async getAll(dto: GetAllDto): Promise<DatabaseViewModel[]> {
    const databases = await this.databaseRepository.findMany({
      include: { _count: { select: { schedule: true } } },
      where: { inactiveAt: dto.active ? null : { not: null } },
      orderBy: { createdAt: 'asc' },
    });
    return databases.map(database => ({
      active: !database.inactiveAt,
      createdAt: database.createdAt,
      idDatabase: database.id,
      name: database.name,
      host: database.host,
      scheduleCount: database._count.schedule,
    }));
  }

  getTypes(): IdNameViewModel[] {
    return fromEnumToIdName(DatabaseTypeEnum);
  }
}
