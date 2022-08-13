import { PathLike } from 'fs';
import { access } from 'fs/promises';

export function pathExists(path: PathLike): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch(() => false);
}
