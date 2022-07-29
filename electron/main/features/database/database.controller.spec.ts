import { mock } from 'vitest-mock-extended';

import { TestBed } from '../../test-bed/test-bed';

import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

describe('DatabaseController', () => {
  let controller: DatabaseController;

  const databaseServiceMock = mock<DatabaseService>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      controllers: [DatabaseController],
      providers: [{ provide: DatabaseService, useFactory: () => databaseServiceMock }],
    });
    controller = TestBed.get(DatabaseController);
  });

  it('should create instance', () => {
    expect(controller).toBeDefined();
  });
});
