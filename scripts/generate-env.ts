import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

import { pathExists } from '../electron/main/util/path-exists';

const ENV_PATH = join(process.cwd(), '.env');
const DATABASE_URL_KEY = 'DATABASE_URL';
const DATABASE_URL_PATH = join(homedir(), '.fus', 'database', 'data.sqlite');
const DATABASE_URL_ENTRY = `${DATABASE_URL_KEY}="file:${DATABASE_URL_PATH}"`;

async function update(): Promise<void> {
  const file = await readFile(ENV_PATH, { encoding: 'utf8' });
  if (file.includes('DATABASE_URL')) {
    return;
  }
  await writeFile(ENV_PATH, `${file}\n${DATABASE_URL_ENTRY}`);
}

async function create(): Promise<void> {
  await writeFile(ENV_PATH, DATABASE_URL_ENTRY);
}

(async () => {
  if (await pathExists(ENV_PATH)) {
    await update();
  } else {
    await create();
  }
})();
