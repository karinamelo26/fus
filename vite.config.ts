import { rmSync } from 'fs';
import { join } from 'path';

import react from '@vitejs/plugin-react';
import swc from 'rollup-plugin-swc';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';

rmSync(join(__dirname, 'dist'), { recursive: true, force: true }); // v14.14.0

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@styles': join(__dirname, 'src/styles'),
    },
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            sourcemap: true,
            outDir: 'dist/electron/main',
          },
          esbuild: false,
          plugins: [
            swc({
              sourceMaps: true,
              jsc: {
                parser: {
                  syntax: 'typescript',
                  dynamicImport: true,
                  decorators: true,
                },
                target: 'es2022',
                transform: {
                  decoratorMetadata: true,
                },
              },
            }),
          ],
        },
      },
      preload: {
        input: {
          // You can configure multiple preload scripts here
          index: join(__dirname, 'electron/preload/index.ts'),
        },
        vite: {
          build: {
            // For debug
            sourcemap: 'inline',
            outDir: 'dist/electron/preload',
          },
        },
      },
      // Enables use of Node.js API in the Electron-Renderer
      renderer: {},
    }),
  ],
});
