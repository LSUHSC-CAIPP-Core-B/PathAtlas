import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { INDEX_FILES } from '../constants';
import { getChecksums } from '../filesystem/processes';
import type { EntryIndex } from '../filesystem/types';
import { logProjectChanges } from './logging';
import { resolveIndexes } from '../filesystem';

type Project = {
  absolutePath: string;
} & EntryIndex;

export function manageProject(entry: EntryIndex) {
  const project: Project = {
    absolutePath: resolve(entry.path),
    ...entry,
  };

  const parentPathRegExp = new RegExp(`^${entry.path}\/?`, 'gi');

  // console.log(project);
  const checksums: EntryIndex[] = 
    (project.status === 'DELETED' || project.status === 'ORIGINAL' ) ? [] :
    getChecksums(project.path).map(sum => {
      sum.path = sum.path.replace(parentPathRegExp, '');
      return sum;
    })


  if (project.status === 'CREATED') createProject(project, checksums);
  else if (project.status === 'UPDATED') updateProject(project, checksums);
  else if (project.status === 'DELETED') removeProject(project, checksums);

    // saveIndexes(project, checksums);
}

function createProject(project: EntryIndex, entries: EntryIndex[]
) {
  const checksums = entries.map((sum) => {
    sum.status = 'CREATED';
    return sum;
  });
  // console.log(checksums);

  logProjectChanges(project, checksums);
}

function updateProject(project: EntryIndex, entries: EntryIndex[]) {
  const prevEntries = fetchIndexes(project);
  const entryList = resolveIndexes(prevEntries, entries);
  
  logProjectChanges(project, entryList);

  // TODO
}

function removeProject(project: EntryIndex, entries: EntryIndex[]) {
  logProjectChanges(project, []);
  // TODO
}

function fetchIndexes(project: EntryIndex): EntryIndex[] {
  const indexFile = join(project.path, INDEX_FILES);
  if (!existsSync(indexFile)) return [];

  const content = readFileSync(indexFile, { encoding: 'utf8' });
  return JSON.parse(content);
}

function saveIndexes(project: EntryIndex, indexes: EntryIndex[]) {
  const indexFile = join(project.path, INDEX_FILES);
  writeFileSync(indexFile, JSON.stringify(indexes));
}
