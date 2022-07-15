import { ChildProcess, spawn } from 'child_process';
import { copyFile, readFile, rm } from 'fs/promises';

import { build as esbuild, BuildOptions } from 'esbuild';
import globby from 'globby';
import TscWatchClient from 'tsc-watch/client';
import { CompilerOptions, createProgram, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';
import { PluginOption, ResolvedConfig } from 'vite';

async function getCompilerOptions(production = false): Promise<CompilerOptions> {
  const tsConfigFile = await readFile('tsconfig.json');
  const compilerOptions: CompilerOptions = JSON.parse(tsConfigFile.toString()).compilerOptions;
  return {
    ...compilerOptions,
    sourceMap: !production,
    declaration: !production,
    target: ScriptTarget.ESNext,
    moduleResolution: ModuleResolutionKind.NodeJs,
    module: ModuleKind.CommonJS,
    outDir: 'dist/electron/temp-main',
  };
}

async function getFiles(): Promise<string[]> {
  return globby('electron/main/**/*.ts');
}

function getEsbuildConfig(production = false, path = 'dist/electron/temp-main/index.js'): BuildOptions {
  return {
    bundle: true,
    entryPoints: [path],
    platform: 'node',
    external: ['typeorm', 'sqlite3', 'electron'],
    outfile: 'dist/electron/main/index.js',
    sourcemap: !production,
    minify: production,
  };
}

function build(): PluginOption {
  let config: ResolvedConfig | undefined;
  return {
    name: 'vite-plugin-electron-main-build',
    apply: 'build',
    configResolved: resolvedConfig => {
      config = resolvedConfig;
    },
    writeBundle: async () => {
      console.log('Building electron');
      console.log('Getting files');
      const files = await getFiles();
      console.log('Getting compiler options');
      const compilerOptions = await getCompilerOptions(config?.isProduction);
      const program = createProgram(files, compilerOptions);
      console.log('Transpiling typescript files');
      program.emit();
      console.log('Bundling with esbuild');
      await esbuild(getEsbuildConfig(config?.isProduction));
      console.log('Copying files to build');
      await Promise.all([
        rm('dist/electron/temp-main', { recursive: true }),
        copyFile('package.json', 'dist/electron/main/package.json'),
      ]);
      console.log('Build completed!');
    },
  };
}

declare global {
  namespace NodeJS {
    interface Process {
      electronApp?: ChildProcess;
    }
  }
}

function serve(): PluginOption {
  const watch = new TscWatchClient();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const electronPath = require('electron') as unknown as string;
  let electronApp: ChildProcess | undefined;
  return {
    name: 'vite-plugin-electron-main-serve',
    apply: 'serve',
    configureServer: server => {
      server.httpServer?.on('listening', async () => {
        console.log('starting server');
        watch.on('success', async () => {
          if (electronApp) {
            electronApp.removeAllListeners();
            electronApp.kill();
          }
          console.log('Building files with esbuild');
          await esbuild(getEsbuildConfig(false, 'dist/temp/electron/main/index.js'));
          server.ws.send({ type: 'full-reload' });
          electronApp = spawn(electronPath, ['.'], { stdio: 'inherit' });
          electronApp.on('error', () => {
            console.log({ hasError: 'error' });
            watch.kill();
            process.exit(1);
            server.close();
          });
          console.log('Finished building');
        });
        watch.start('--project', 'tsconfig.dev.json', '--outDir', 'dist/temp', '--preserveWatchOutput');
      });
    },
  };
}

export function main(): PluginOption[] {
  return [build(), serve()];
}
