import { join } from 'path';

import { build as viteBuild, InlineConfig, PluginOption, ResolvedConfig } from 'vite';
import electronRenderer from 'vite-plugin-electron-renderer';

import { DIST_ELECTRON_PATH, ELECTRON_PATH } from './constants';

function getBuildConfig(production = false): InlineConfig {
  return {
    configFile: false,
    envFile: false,
    publicDir: false,
    mode: production ? 'production' : 'development',
    build: {
      emptyOutDir: false,
      minify: production,
      rollupOptions: {
        input: {
          index: join(ELECTRON_PATH, 'preload', 'index.ts'),
        },
        output: {
          format: 'cjs',
          manualChunks: {},
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
      outDir: join(DIST_ELECTRON_PATH, 'preload'),
      sourcemap: !production,
    },
    plugins: [electronRenderer({})],
  };
}

function serve(): PluginOption {
  return {
    name: 'vite-plugin-electron-serve-preload',
    apply: 'serve',
    configureServer: (server) => {
      server.httpServer?.on('listening', async () => {
        const config = getBuildConfig();
        await viteBuild({
          ...config,
          build: {
            ...config.build,
            watch: {
              include: ['electron/preload/**/*'],
            },
          },
          plugins: [
            ...(config.plugins ?? []),
            {
              name: 'vite-plugin-electron-serve-preload-watcher',
              writeBundle: () => {
                server.ws.send({ type: 'full-reload' });
              },
            },
          ],
        });
      });
    },
  };
}

function build(): PluginOption {
  let config: ResolvedConfig | undefined;
  return {
    name: 'vite-plugin-electron-build-preload',
    apply: 'build',
    configResolved: (configResolved) => {
      config = configResolved;
    },
    writeBundle: async () => {
      const viteConfig = getBuildConfig(config?.mode === 'production');
      await viteBuild(viteConfig);
    },
  };
}

export function preload(): PluginOption[] {
  return [serve(), build()];
}
