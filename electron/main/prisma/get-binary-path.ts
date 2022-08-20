import { join } from 'path';

type Platform = NodeJS.Platform | 'darwinArm64';

interface Engines {
  migrationEngine: string;
  queryEngine: string;
}

const platformToExecutables = new Map<Platform, Engines>()
  .set('win32', {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-windows.exe',
    queryEngine: 'node_modules/@prisma/engines/query_engine-windows.dll.node',
  })
  .set('linux', {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-debian-openssl-1.1.x',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node',
  })
  .set('darwin', {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-darwin',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin.dylib.node',
  })
  .set('darwinArm64', {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-darwin-arm64',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node',
  });

function getPlatformName(): Platform {
  const isDarwin = process.platform === 'darwin';
  if (isDarwin && process.arch === 'arm64') {
    return 'darwinArm64';
  }
  return process.platform;
}

// TODO Get more engines in the bundle
export function getBinaryPaths(): Engines {
  const platformName = getPlatformName();
  const engine = platformToExecutables.get(platformName);
  if (!engine) {
    throw new Error(`Platform ${platformName} not supported`);
  }
  return {
    queryEngine: join(process.cwd(), engine.queryEngine),
    migrationEngine: join(process.cwd(), engine.migrationEngine),
  };
}
