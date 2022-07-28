import { Injectable } from '../../di/injectable';

import { DatabaseRepository } from './database.repository';

@Injectable({ global: true })
export class DatabaseService {
  constructor(private readonly databaseRepository: DatabaseRepository) {}
}
