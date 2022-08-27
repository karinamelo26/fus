import { spawn, SpawnOptions } from 'child_process';
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

export async function spawnAsync(command: string, args: string[], options?: SpawnOptions): Promise<void> {
  const newOptions: SpawnOptions = { ...options, stdio: 'inherit', env: process.env };
  return new Promise((resolve, reject) => {
    try {
      const spawnCmd = spawn(command, args, newOptions);
      spawnCmd.on('close', () => {
        resolve();
      });
      spawnCmd.on('error', err => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
