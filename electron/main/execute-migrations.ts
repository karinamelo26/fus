import { fork } from 'child_process';
import { join, resolve as pathResolve } from 'path';

import { app } from 'electron';

import { getBinaryPaths } from './prisma/get-binary-path';

export async function executeMigrations(databaseUrl: string): Promise<number> {
  const appPath = app.getAppPath();
  const appPathUnpacked = appPath.replace('app.asar', 'app.asar.unpacked');
  const binaryPaths = getBinaryPaths();
  const queryEnginePath = join(appPathUnpacked, binaryPaths.queryEngine);
  const migrationEnginePath = join(appPathUnpacked, binaryPaths.migrationEngine);
  const prismaPath = pathResolve(app.getAppPath(), 'node_modules/prisma/build/index.js');

  const exitCode = await new Promise((resolve, reject) => {
    const child = fork(prismaPath, ['migrate', 'deploy'], {
      env: {
        ...process.env,
        PRISMA_MIGRATION_ENGINE_BINARY: migrationEnginePath,
        PRISMA_QUERY_ENGINE_LIBRARY: queryEnginePath,
        DATABASE_URL: databaseUrl,
      },
      stdio: 'pipe',
    });

    let fullError: string;

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (fullError) {
        reject(fullError);
        return;
      }
      resolve(code);
    });

    child.stderr?.on('data', (data) => {
      fullError += data.toString();
    });
  });

  if (exitCode !== 0) {
    throw Error(`command failed with exit code ${exitCode}`);
  }

  return exitCode;
}
