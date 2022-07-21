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

const onlyFrontEnd = !!process.env.ONLY_FRONT_END;

export default defineConfig(async () => {
  await deleteDist();
  const plugins: PluginOption[] = [react({ fastRefresh: false })];
  if (!onlyFrontEnd) {
    plugins.push(await electron());
  }
  return {
    base: './',
    clearScreen: false,
    resolve: {
      alias: {
        '@styles': join(SRC_PATH, 'styles'),
      },
    },
    server: {
      port: 4200,
    },
    plugins,
  };
});
