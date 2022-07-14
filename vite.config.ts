import { join } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';

import { main } from './scripts/main';
import { preload } from './scripts/preload';
import { deleteDist } from './scripts/utils';

async function electron(): Promise<PluginOption[]> {
  return [preload(), main()];
}

export default defineConfig(async () => {
  await deleteDist();
  return {
    clearScreen: false,
    resolve: {
      alias: {
        '@styles': join(__dirname, 'src/styles'),
      },
    },
    plugins: [
      react({
        include: ['src/**/*.jsx'],
      }),
      await electron(),
      // viteElectron(),
    ],
  };
});
