import { ChildProcess, spawn } from 'child_process';
import { copyFile, readFile, rm, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import { performance } from 'perf_hooks';

import { build as esbuild, BuildOptions } from 'esbuild';
import { copy } from 'fs-extra';
import globby from 'globby';
import TscWatchClient from 'tsc-watch/client';
import { CompilerOptions, createProgram, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';
import { PluginOption, ResolvedConfig } from 'vite';

import { Logger } from '../electron/main/logger/logger';
import { getBinaryPaths } from '../electron/main/prisma/get-binary-path';
import { calculateAndFormatPerformanceTime } from '../electron/main/util/format-performance-time';

import { DIST_ELECTRON_PATH, DIST_PATH, ELECTRON_PATH } from './constants';

const DIST_ELECTRON_TEMP_BUILD_PATH = join(DIST_ELECTRON_PATH, 'temp-main');
const DIST_ELECTRON_TEMP_SERVE_PATH = join(DIST_PATH, 'temp');

let cachedCompilerOptions: CompilerOptions | undefined;

async function getCompilerOptions(production = false): Promise<CompilerOptions> {
  const compilerOptions =
    cachedCompilerOptions ??
    (cachedCompilerOptions = await readFile(join(process.cwd(), 'tsconfig.json')).then(
      file => JSON.parse(file.toString()).compilerOptions
    ));
  return {
    ...compilerOptions,
    sourceMap: !production,
    declaration: !production,
    target: ScriptTarget.ESNext,
    moduleResolution: ModuleResolutionKind.NodeJs,
    module: ModuleKind.CommonJS,
    outDir: DIST_ELECTRON_TEMP_BUILD_PATH,
  };
}

async function getFiles(): Promise<string[]> {
  return globby('electron/main/**/*.ts');
}

function getEsbuildConfig(production = false, path = join(DIST_ELECTRON_TEMP_BUILD_PATH, 'index.js')): BuildOptions {
  return {
    bundle: true,
    entryPoints: [path],
    platform: 'node',
    external: ['typeorm', 'sqlite3', 'electron'],
    outfile: join(DIST_ELECTRON_PATH, 'main', 'index.js'),
    sourcemap: !production,
    minify: production,
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
      logger.log('Getting files');
      const files = await getFiles();
      logger.log('Getting compiler options');
      const compilerOptions = await getCompilerOptions(config?.isProduction);
      const program = createProgram(files, compilerOptions);
      logger.log('Transpiling typescript files');
      program.emit();
      logger.log('Bundling with esbuild');
      await esbuild(getEsbuildConfig(config?.isProduction));
      logger.log('Copying files to build');
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJsonFile = await readFile(packageJsonPath, { encoding: 'utf8' });
      const packageJson = JSON.parse(packageJsonFile);
      packageJson.prisma = undefined;
      const binaryPaths = getBinaryPaths();
      await Promise.all([
        rm(DIST_ELECTRON_TEMP_BUILD_PATH, { recursive: true }),
        writeFile(join(DIST_ELECTRON_PATH, 'main', 'package.json'), JSON.stringify(packageJson)),
        copyFile(
          join(ELECTRON_PATH, 'main', 'prisma', 'schema.prisma'),
          join(DIST_ELECTRON_PATH, 'main', 'schema.prisma')
        ),
        copy(join(ELECTRON_PATH, 'main', 'prisma', 'migrations'), join(DIST_ELECTRON_PATH, 'main', 'migrations')),
        copyFile(binaryPaths.queryEngine, join(DIST_ELECTRON_PATH, 'main', basename(binaryPaths.queryEngine))),
      ]);
      const endMs = performance.now();
      logger.log('Build completed!', ...calculateAndFormatPerformanceTime(startMs, endMs));
    },
  };
}

function serve(): PluginOption {
  const watch = new TscWatchClient();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const electronPath = require('electron') as unknown as string;
  let electronApp: ChildProcess | undefined;
  const logger = Logger.create('Main serve');
  return {
    name: 'vite-plugin-electron-main-serve',
    apply: 'serve',
    configureServer: server => {
      server.httpServer?.on('listening', async () => {
        watch.on('success', async () => {
          const startMs = performance.now();
          logger.log('Building files with esbuild');
          if (electronApp) {
            electronApp.removeAllListeners();
            electronApp.kill();
          }
          await esbuild(getEsbuildConfig(false, join(DIST_ELECTRON_TEMP_SERVE_PATH, 'electron', 'main', 'index.js')));
          server.ws.send({ type: 'full-reload' });
          electronApp = spawn(electronPath, ['.'], { stdio: 'inherit' });
          electronApp.on('error', () => {
            watch.kill();
            process.exit(1);
            server.close();
          });
          const endMs = performance.now();
          logger.log('Finished building', ...calculateAndFormatPerformanceTime(startMs, endMs));
        });
        watch.start('--project', 'tsconfig.dev.json');
      });
    },
  };
}

export function main(): PluginOption[] {
  return [build(), serve()];
}
