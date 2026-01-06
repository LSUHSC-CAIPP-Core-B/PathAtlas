import { execSync } from 'node:child_process';
import { hash as quickHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join as joinPaths } from 'node:path';
import ignore from 'ignore';
import { INDEX_FILES } from '../constants';
import type { EntryIndex } from './types';

const ROOT = process.cwd();
const ATLAS_IGNORE = createAltasIgnore();

function createAltasIgnore() {
  // Let's load in the .atlasignore file
  // and prepare for filtering out files
  const ignoreFile = joinPaths(ROOT, '.atlasignore');
  const contents = readFileSync(ignoreFile, { encoding: 'utf8' }).toString();

  return ignore().add(contents).add(`**/${INDEX_FILES}`);
}

function prepareHashes(...hashArr: string[]): EntryIndex[] {
  // We might get a bunch of hashes or nothing,
  // let's group them together.
  const hashes = hashArr.join('\n').split('\n');

  return hashes
    .map((hash) => hash.split(/(?<=[\da-f]{64})\s+/))
    .map(([hash, path]) => ({ hash, path }));
}

function preparePaths(isDirectory: boolean, ...pathArr: string[]) {
  // We get both a single path and multiple paths,
  // join them and split them out again.
  const paths = pathArr.join('\n').split('\n');
  // If the path has the relative prefix `./`
  // then remove the prefix. Also, let's get
  // rid of the "relative" roots
  return paths
    .map((path) => (path.startsWith('./') ? path.substring(2) : path))
    .map((path) => path + (isDirectory ? '/' : ''))
    .filter((path) => path && !path.match(/^(?:.\/)?$/));
}

function fetchFiles(
  filterDirectory: boolean = false,
  directory: string = '.',
  maxdepth: number = 0,
) {
  // Let's get all the paths and remove the
  // relative path prefix `./`
  const results = runProcess(
    `find "${directory}" -type ${filterDirectory ? 'd' : 'f'}`,
    maxdepth > 0 ? `-maxdepth ${maxdepth}` : '',
  );
  const paths = preparePaths(filterDirectory, results);

  // Let's check we have a file before filtering,
  // otherwise we can get an error
  if (!paths || paths.length === 0) return [];

  // Time to filter out files based on the
  // .atlasignore file
  return ATLAS_IGNORE.filter(paths);
}

function prepareFilesForCmds(...files: string[]) {
  return files
    .filter((f) => !!f)
    .map((f) => `"${f}"`)
    .join(' ');
}

function hashDirectory(directory: string) {
  // Get all the files in the directory.
  const files = fetchFiles(false, directory);
  // If no files exists, let's return the
  // hash of the directory name.
  if (!files || files.length === 0) return `${quickHash('sha256', directory)}  -`;

  const paths = prepareFilesForCmds(...files);
  // We got files, let's hash them all
  return runProcess(`find ${paths} -type f -exec sha256sum {} + | sort | sha256sum`);
}

export function getChecksums(directory?: string) {
  if (!directory) {
    // No direcory was set, let's do a quick
    // lookup for any changes.

    const directories = fetchFiles(true, '.', 1);
    if (!directories || directories.length === 0) return;

    const sums = directories
      .map((directory) => hashDirectory(directory).replace('-', directory))
      .join('\n');

    return prepareHashes(sums);
  } else {
    // A directory was set, let's get all the
    // files and their hashes.

    const files = fetchFiles(false, directory);
    if (!files || files.length === 0) return;

    const path = prepareFilesForCmds(...files);
    // We git files, let's hash them all
    const sums = runProcess(`find ${path} -exec sha256sum {} +`);

    return prepareHashes(sums);
  }
}

function runProcess(cmd: string, ...args: string[]) {
  try {
    const cmdArguments = args.map((a) => ' '.concat(a));
    return execSync(cmd.concat(...cmdArguments), {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (e) {
    // Surface any output for debugging
    if (e.stdout) process.stderr.write(e.stdout);
    if (e.stderr) process.stderr.write(e.stderr);
    throw e;
  }
}
