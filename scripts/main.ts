import { ChildProcess, spawn } from 'child_process';
import { copyFile, readFile, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import { performance } from 'perf_hooks';

import { build as esbuild, BuildOptions } from 'esbuild';
import { esbuildPluginDecorator } from 'esbuild-plugin-decorator';
import { copy } from 'fs-extra';
import { PackageJson } from 'type-fest';
import { PluginOption, ResolvedConfig } from 'vite';

import { Logger } from '../electron/main/logger/logger';
import { getBinaryPaths } from '../electron/main/prisma/get-binary-path';
import { calculateAndFormatPerformanceTime } from '../electron/main/util/format-performance-time';

import { DIST_ELECTRON_PATH, ELECTRON_PATH } from './constants';

function getGlobalVars(production = false): Record<string, string> {
  return {
    devMode: `${!production}`,
  };
}

function getEsbuildConfig(production = false): BuildOptions {
  const globalVars = getGlobalVars(production);
  return {
    bundle: true,
    entryPoints: [join(ELECTRON_PATH, 'main', 'index.ts')],
    platform: 'node',
    external: ['electron'],
    outfile: join(DIST_ELECTRON_PATH, 'main', 'index.js'),
    sourcemap: !production,
    minify: production,
    define: globalVars,
    keepNames: true,
    plugins: [
      esbuildPluginDecorator({
        compiler: 'swc',
        swcCompilerOptions: {
          jsc: {
            keepClassNames: true,
            target: 'es2022',
            transform: {
              optimizer: {
                globals: {
                  vars: globalVars,
                },
              },
            },
          },
        },
      }),
    ],
  };
}

function build(): PluginOption {
  const logger = Logger.create('Main build');
  let config: ResolvedConfig | undefined;
  return {
    name: 'vite-plugin-electron-main-build',
    apply: 'build',
    configResolved: resolvedConfig => {
      config = resolvedConfig;
    },
    writeBundle: async () => {
      const startMs = performance.now();
      logger.log('Building electron');
      logger.log('Bundling with esbuild');
      await esbuild(getEsbuildConfig(config?.isProduction));
      logger.log('Finished esbuild bundling', ...calculateAndFormatPerformanceTime(startMs, performance.now()));
      logger.log('Copying files to build');
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJsonFile = await readFile(packageJsonPath, { encoding: 'utf8' });
      const packageJson: PackageJson & Record<string, unknown> = JSON.parse(packageJsonFile);
      // Prisma is not customized in production code
      packageJson.prisma = undefined;
      // Assertion here because we certainly have scripts in our package.json
      packageJson.scripts!.postinstall = undefined;
      // We don't need devDependencies in production
      packageJson.devDependencies = undefined;
      // We don't engines in production
      packageJson.engines = undefined;
      const binaryPaths = getBinaryPaths();
      await Promise.all([
        // Add modified package.json do dist
        writeFile(join(DIST_ELECTRON_PATH, 'main', 'package.json'), JSON.stringify(packageJson)),
        // Copy prisma schema to dist
        copyFile(
          join(ELECTRON_PATH, 'main', 'prisma', 'schema.prisma'),
          join(DIST_ELECTRON_PATH, 'main', 'schema.prisma')
        ),
        // Copy migrations folder to dist
        copy(join(ELECTRON_PATH, 'main', 'prisma', 'migrations'), join(DIST_ELECTRON_PATH, 'main', 'migrations')),
        // Copy prisma binaries to dist
        // TODO add more binaries for different OS's
        copyFile(binaryPaths.queryEngine, join(DIST_ELECTRON_PATH, 'main', basename(binaryPaths.queryEngine))),
      ]);
      logger.log('Build completed!', ...calculateAndFormatPerformanceTime(startMs, performance.now()));
    },
  };
}

function serve(): PluginOption {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const electronPath = require('electron') as unknown as string;
  let electronApp: ChildProcess | undefined;
  const logger = Logger.create('Main serve');
  return {
    name: 'vite-plugin-electron-main-serve',
    apply: 'serve',
    configureServer: server => {
      function onRebuild(): void {
        if (electronApp) {
          electronApp.removeAllListeners();
          electronApp.kill();
        }
        server.ws.send({ type: 'full-reload' });
        logger.log('Opening electron app');
        electronApp = spawn(electronPath, ['.'], { stdio: 'inherit', env: process.env });
        electronApp.on('error', () => {
          onError();
        });
      }

      function onError(): void {
        if (electronApp) {
          electronApp.removeAllListeners();
          electronApp.kill();
        }
        process.exit(1);
        server.close();
      }

      server.httpServer?.on('listening', async () => {
        logger.log('Building files with esbuild');
        const startMs = performance.now();
        await esbuild({
          ...getEsbuildConfig(false),
          watch: {
            onRebuild: error => {
              if (error) {
                logger.error('Esbuild bundle error', error);
                onError();
                return;
              }
              logger.log('Finished building');
              onRebuild();
            },
          },
          incremental: true,
        });
        const endMs = performance.now();
        logger.log('Finished building', ...calculateAndFormatPerformanceTime(startMs, endMs));
        onRebuild();
        logger.log('Now watching for changes...');
      });
    },
  };
}

export function main(): PluginOption[] {
  return [build(), serve()];
}
