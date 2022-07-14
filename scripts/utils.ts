import { spawn, SpawnOptions } from 'child_process';
import { PathLike } from 'fs';
import { access, rm } from 'fs/promises';

export function pathExists(path: PathLike): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

export async function deleteDist(): Promise<void> {
  if (await pathExists('dist')) {
    await rm('dist', { recursive: true });
  }
}

export async function asyncSpawn(command: string, options?: SpawnOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const spawnCmd = spawn(command, options ?? {});
      spawnCmd.on('close', () => {
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}
