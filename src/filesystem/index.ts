import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { INDEX_FILE } from '../constants';
import { getChecksums } from './processes';
import type { EntryIndex } from './types';

function loadIndexFile(): EntryIndex[] {
  if (!existsSync(INDEX_FILE)) return [];
  const contents = readFileSync(INDEX_FILE, { encoding: 'utf8' });
  return JSON.parse(contents);
}

function resolveIndexes(oldIndexes: EntryIndex[], newIndexes: EntryIndex[]) {
  const indexes: EntryIndex[] = [];

  // Let's add all the old indexes first
  // Making sure to mark them as deleted
  for (const index of oldIndexes) {
    if (index.status === 'DELETED') continue;
    index.status = 'DELETED';
    indexes.push(index);
  }

  // Let's update existing indexes or
  // creating new ones as we find them
  for (const index of newIndexes) {
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
  writeFileSync(INDEX_FILE, content, { encoding: 'utf8' });
}

export function fetchIndexes() {
  const prevIndexes: EntryIndex[] = loadIndexFile();
  const currentIndexed: EntryIndex[] = getChecksums();

  // Let's resolve the projects and
  // index them.
  const indexes = resolveIndexes(prevIndexes, currentIndexed);

  saveIndexes(indexes);
  return indexes;
}
