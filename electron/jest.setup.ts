import 'reflect-metadata';
import { mock } from 'jest-mock-extended';

import { TestUtil } from './main/test-util/test-util';

global.devMode = false;

jest.mock('fs');
jest.mock('fs/promises', () => {
  const originalModule = jest.requireActual('fs/promises');
  return {
    ...originalModule,
    access: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
  } as typeof import('fs/promises');
});
jest.mock('os', () => {
  const originalModule = jest.requireActual('os');
  return {
    ...originalModule,
    homedir: jest.fn().mockReturnValue(TestUtil.HOME_DIR),
  } as typeof import('os');
});
jest.mock('electron', () => mock<typeof import('electron')>());
