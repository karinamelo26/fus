import { Config } from '@jest/types';
import { Config as SwcConfig } from '@swc/core/types';

const swcConfig: SwcConfig = {
  jsc: {
    transform: {
      decoratorMetadata: true,
    },
    parser: {
      decorators: true,
      syntax: 'typescript',
    },
    keepClassNames: true,
    target: 'es2022',
  },
};

const config: Config.InitialOptions = {
  projects: ['<rootDir>/electron/jest.config.ts', '<rootDir>/src/jest.config.ts'],
  setupFiles: ['./jest.setup.ts'],
  setupFilesAfterEnv: ['./jest-after-env.setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', swcConfig as Record<string, unknown>],
  },
  collectCoverageFrom: [
    'electron/main/**/*.ts',
    'electron/preload/**/*.ts',
    '!**/*.{type,enum,token,module,spec}.ts',
    '!electron/main/test-bed/**/*.ts',
  ],
};

export default config;
