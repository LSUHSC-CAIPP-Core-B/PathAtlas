import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { INDEX_FILES } from '../constants';
import { fetchFiles } from './processes';
import type { EntryIndex } from './types';
import { getFolders } from './utils';

function loadIndexFile(): EntryIndex[] {
  if (!existsSync(INDEX_FILES)) return [];
  const contents = readFileSync(INDEX_FILES, { encoding: 'utf8' });
  return JSON.parse(contents);
}

export function resolveIndexes(oldIndexes: EntryIndex[], newIndexes: EntryIndex[]) {
  const indexes: EntryIndex[] = [];

  // Let's add all the old indexes first
  // Making sure to mark them as deleted
  if (oldIndexes && oldIndexes.length > 0)
    for (const index of oldIndexes) {
      if (index.status === 'DELETED') continue;
      index.status = 'DELETED';
      indexes.push(index);
    }

  // Let's update existing indexes or
  // creating new ones as we find them
  if (newIndexes && newIndexes.length > 0)
    for (const index of newIndexes) {
      if (index == null) continue;

      // Look up if the index already exists
      const lookup = indexes.find((i) => i.path === index.path);
      if (lookup) {
        // If the index exists, let's check
        // if it's been changed.
        const newStatus = lookup.hash === index.hash ? 'ORIGINAL' : 'UPDATED';
        if (newStatus === 'UPDATED') lookup.hash = index.hash;
        lookup.status = newStatus;
        continue;
      }

      // No index was found, let's add it.
      index.status = 'CREATED';
      indexes.push(index);
    }

  // Grab all the indexes when we
  // are done.
  return indexes;
}

function saveIndexes(indexes: EntryIndex[]) {
  const content = JSON.stringify(indexes);
  writeFileSync(INDEX_FILES, content, { encoding: 'utf8' });
}

function hashProject$single(project: string, entries: EntryIndex[]) {
  const hash = createHash('sha256').update(project);

  const sortedEntries = entries.sort((a, b) => a.path.localeCompare(b.path));
  for (const entry of sortedEntries) hash.update(entry.path).update(entry.hash);

  return hash.digest('hex');
}

function hashProjects(projectEntries: Record<string, EntryIndex[]>) {
  if (projectEntries == null) return [];

  return Object.entries(projectEntries)
    .map(([project, entries]) => [project, hashProject$single(project, entries)])
    .reduce((obj: EntryIndex[], [path, hash]) => {
      obj.push({ hash, path: path.concat('/') });
      return obj;
    }, []);
}

export function fetchIndexes(
  projectEntries: Record<string, EntryIndex[]>,
  projects: string[] = [],
) {
  if (projects.length === 0) projects = getFolders();
  if (projects.length === 0) return [];

  // Let's get the filtered project paths
  // and the previous hashed indexes
  const projectPaths = fetchFiles(true, projects, 1, false);
  const prevIndexes: EntryIndex[] = loadIndexFile();

  // Let's create the new hashed indexes
  // and keep old hashes that we aren't
  // looking over.
  const hashedEntries = hashProjects(projectEntries);
  const currentIndexes = prevIndexes
    .filter((index) => !(!projectPaths || projectPaths.includes(index.path)))
    .concat(hashedEntries);

  // Let's resolve the projects and
  // index them.
  const indexes = resolveIndexes(prevIndexes, currentIndexes);

  saveIndexes(indexes);
  return indexes;
}
