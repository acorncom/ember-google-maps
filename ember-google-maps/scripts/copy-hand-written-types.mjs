import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const from = new URL('../unpublished-development-types/', import.meta.url);
const to = new URL('../declarations/', import.meta.url);

if (existsSync(from)) {
  await mkdir(to, { recursive: true });
  await cp(from, to, { recursive: true });
}
