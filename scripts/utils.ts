import { rm } from 'fs/promises';

import { pathExists } from '../electron/main/util/path-exists';

export async function deleteDist(): Promise<void> {
  if (await pathExists('dist')) {
    await rm('dist', { recursive: true });
  }
}

export async function deleteRelease(): Promise<void> {
  if (await pathExists('release')) {
    await rm('release', { recursive: true });
  }
}
