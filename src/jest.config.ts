import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!**/*.{spec}.jsx'],
  transform: {
    '^.+\\.[tj]sx?$': 'esbuild-jest',
  },
  setupFiles: ['./jest.setup.ts'],
};

export default config;
