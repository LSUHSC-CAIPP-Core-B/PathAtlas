import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join as joinPaths } from 'node:path';
import { cwd } from 'node:process';
import ignore from 'ignore';
import { INDEX_FILES } from '../constants';

const ROOT = cwd();
export const ATLAS_IGNORE = createAltasIgnore();

function createAltasIgnore() {
  // Let's load in the .atlasignore file
  // and prepare for filtering out files
  const ignoreFile = joinPaths(ROOT, '.atlasignore');
  const contents = existsSync(ignoreFile) ? readFileSync(ignoreFile, 'utf8') : '';

  return ignore().add(contents).add(`**/${INDEX_FILES}`);
}

export function getFolders() {
  return readdirSync(ROOT, { recursive: false })
    .filter((path) => typeof path === 'string')
    .filter((path) => statSync(path).isDirectory())
    .filter((path) => !ATLAS_IGNORE.test(path).ignored);
}
