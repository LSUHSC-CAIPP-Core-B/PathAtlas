import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join as joinPaths, resolve } from 'node:path';
import ignore from 'ignore';
import { INDEX_FILES, TARGET_DIRECTORY } from '../constants';
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

function preparePaths(isDirectory: boolean, prepPaths: boolean, ...pathArr: string[]) {
  // We get both a single path and multiple paths,
  // join them and split them out again.
  const paths = pathArr.join('\n').split('\n');
  // If the path has the relative prefix `./`
  // then remove the prefix. Also, let's get
  // rid of the "relative" roots
  return paths
    .map((path) => path.replace(/^\.\//g, ''))
    .filter((path) => path?.length > 0)
    .map((path) => path + (isDirectory ? '/' : ''))
    .filter((path) => path && !(prepPaths && path.match(/^(?:.\/)?$/)));
}

export function fetchFiles(
  filterDirectory: boolean = false,
  directoryPaths: string[],
  maxdepth: number = 0,
  prepPaths: boolean = true,
) {
  // Let's check if the path exists before doing anything
  const directories = directoryPaths.filter((directory) =>
    existsSync(resolve(TARGET_DIRECTORY, directory)),
  );
  if (directories.length === 0) return null;

  // Let's get all the paths and remove the
  // relative path prefix `./`
  const prepared = preparePaths(filterDirectory, prepPaths, ...directories);

  const results = runProcess(
    `find ${prepared} -type ${filterDirectory ? 'd' : 'f'}`,
    maxdepth > 0 ? `-maxdepth ${maxdepth}` : '',
  );

  const paths = preparePaths(filterDirectory, true, results);

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

// function hashDirectory(directory: string) {
//   // Get all the files in the directory.
//   const files = fetchFiles(false, directory);
//   // If no files exists, let's return the
//   // hash of the directory name.
//   if (!files || files.length === 0) return `${quickHash('sha256', directory)}  -`;

//   const paths = prepareFilesForCmds(...files);
//   // We got files, let's hash them all
//   return runProcess(`find ${paths} -type f -exec sha256sum {} + | sort | sha256sum`);
// }

function groupSums(obj: Record<string, EntryIndex[]>, entry: EntryIndex) {
  // Let's make sure the entry exists
  if (entry == null) return obj;

  // Let's get the required variables
  const { path: PATH } = entry;
  const [GROUP] = PATH.split('/', 1);

  // Let's fetch the grouped entries
  const GROUPED_ENTRIES: EntryIndex[] = obj[GROUP] ?? [];

  entry.path = PATH.replace(/^[^/]+\//gi, '');
  GROUPED_ENTRIES.push(entry);

  // And we should update the object
  // before returning it.
  obj[GROUP] = GROUPED_ENTRIES;
  return obj;
}

export function getChecksums(directoryPaths: string[]) {
  // No direcory was set, let's do a quick
  // lookup for any changes.
  if (directoryPaths.length === 0) directoryPaths.push('.');

  // Let's look up any changes for any and
  // all directories.
  const directories = directoryPaths.map((directory) =>
    directory.match(/^\.\/?/gi) ? directory : './'.concat(directory),
  );

  // Let's get all the files from the
  // directories.
  const files = fetchFiles(false, directories);
  if (!files || files.length === 0) return;

  // We got files, let's hash them all
  const path = prepareFilesForCmds(...files);
  const sums = runProcess(`find ${path} -exec sha256sum {} +`);

  // We got all the checksums, let's organize
  // them by parents.
  const projectSums = prepareHashes(sums).reduce(groupSums, {});

  return projectSums;
}

function runProcess(cmd: string, ...args: string[]) {
  try {
    const cmdArguments = args.map((a) => ' '.concat(a));
    return execSync(cmd.concat(...cmdArguments), {
      cwd: TARGET_DIRECTORY,
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
