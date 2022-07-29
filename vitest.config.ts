import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['electron/main/**/*.ts', 'electron/preload/**/*.ts', 'src/**/*.{js,jsx}'],
      exclude: ['**/*.{type,enum,token,module}.ts', 'electron/main/test-bed/**/*.ts'],
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    threads: true,
    globals: true,
    setupFiles: ['vitest.setup.ts'],
  },
});
