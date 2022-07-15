import { join } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';

import { main } from './scripts/main';
import { preload } from './scripts/preload';
import { deleteDist } from './scripts/utils';

async function electron(): Promise<PluginOption[]> {
  return [preload(), main()];
}

const SRC_PATH = join(process.cwd(), 'src');

export default defineConfig(async () => {
  await deleteDist();
  return {
    clearScreen: false,
    resolve: {
      alias: {
        '@styles': join(SRC_PATH, 'styles'),
      },
    },
    plugins: [
      react({
        include: ['src/**/*.jsx'],
        fastRefresh: false,
      }),
      await electron(),
    ],
  };
});
