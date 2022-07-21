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
