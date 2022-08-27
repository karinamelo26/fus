import { copyFile, mkdir, readFile, rm } from 'fs/promises';
import { join } from 'path';

import { PackageJson } from 'type-fest';

import { Logger } from '../electron/main/logger/logger';
import { pathExists } from '../electron/main/util/path-exists';

import { DIST_ELECTRON_PATH } from './constants';
import { spawnAsync } from './utils';

const PACKAGE_NAME = '@prisma/engines';
const BINARIES_FOLDER = join(process.cwd(), 'node_modules', '__prisma-binaries');
const FILES_TO_COPY = [
  'migration-engine-windows.exe',
  'query_engine-windows.dll.node',
  'migration-engine-darwin',
  'libquery_engine-darwin.dylib.node',
  'migration-engine-darwin-arm64',
  'libquery_engine-darwin-arm64.dylib.node',
] as const;
const DESTINATION = join(DIST_ELECTRON_PATH, 'main');

const logger = Logger.create('Prisma Binaries');

async function getPrismaEnginesVersion(): Promise<string> {
  const packageJsonFile = await readFile(join(process.cwd(), 'package.json'), { encoding: 'utf-8' });
  const packageJson: PackageJson = JSON.parse(packageJsonFile);
  return packageJson.devDependencies![PACKAGE_NAME]!.replace(/[\^~]/, '');
}

async function copy(file: string): Promise<void> {
  logger.log(`Copying file ${file}`);
  const path = join(BINARIES_FOLDER, `node_modules`, PACKAGE_NAME, file);
  await copyFile(path, join(DESTINATION, file));
  logger.log(`Copied file ${file}!`);
}

async function installPrismaEnginesBinaries(version: string): Promise<void> {
  const tempFolderExists = await pathExists(BINARIES_FOLDER);
  if (!tempFolderExists) {
    logger.log(`Creating binaries folder`);
    await mkdir(BINARIES_FOLDER);
  }
  logger.log(`Installing ${PACKAGE_NAME}@${version}`);
  await spawnAsync(
    'npx',
    [
      'cross-env',
      'PRISMA_CLI_BINARY_TARGETS=darwin,darwin-arm64,windows',
      `npm install ${PACKAGE_NAME}@${version} --prefix ${BINARIES_FOLDER}`,
    ],
    { shell: true }
  );
}

async function checkIfBinariesAlreadyExists(version: string): Promise<boolean> {
  const packageJsonPath = join(BINARIES_FOLDER, 'package.json');
  const [packageJsonExists, nodeModulesExists] = await Promise.all([
    pathExists(packageJsonPath),
    pathExists(join(BINARIES_FOLDER, 'node_modules', PACKAGE_NAME)),
  ]);
  if (!packageJsonExists || !nodeModulesExists) {
    return false;
  }
  const packageJsonFile = await readFile(packageJsonPath, { encoding: 'utf-8' });
  const packageJson: PackageJson = JSON.parse(packageJsonFile);
  return packageJson.dependencies?.[PACKAGE_NAME]?.replace(/[\^~]/, '') === version;
}

export async function downloadPrismaBinaries(): Promise<void> {
  try {
    logger.log(`Getting ${PACKAGE_NAME} version`);
    const version = await getPrismaEnginesVersion();
    const binariesAlreadyExists = await checkIfBinariesAlreadyExists(version);
    if (!binariesAlreadyExists) {
      await installPrismaEnginesBinaries(version);
    } else {
      logger.log('Binaries already downloaded');
    }
    await Promise.all(FILES_TO_COPY.map(file => copy(file)));
    logger.log('Binaries copied successfully!');
  } catch (error) {
    logger.error('Error at download prisma binaries\n', error);
    try {
      if (await pathExists(BINARIES_FOLDER)) {
        await rm(BINARIES_FOLDER, { recursive: true });
      }
    } catch {
      logger.error(`Failed to delete "${BINARIES_FOLDER}" folder`);
    }
  }
}
