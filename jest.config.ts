import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  projects: ['<rootDir>/electron/jest.config.ts', '<rootDir>/src/jest.config.ts'],
  collectCoverage: true,
  injectGlobals: true,
  coverageReporters: ['text', 'json', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  verbose: true,
  maxWorkers: '50%',
  logHeapUsage: true,
  detectOpenHandles: true,
};

export default config;
