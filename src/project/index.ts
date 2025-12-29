import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { INDEX_FILES } from '../constants';
import { getChecksums } from '../filesystem/processes';
import type { EntryIndex } from '../filesystem/types';
import { logProjectChanges } from './logging';

type Project = {
  absolutePath: string;
} & EntryIndex;

export function manageProject(entry: EntryIndex) {
  const project: Project = {
    absolutePath: resolve(entry.path),
    ...entry,
  };

  // console.log(project);

  if (project.status === 'CREATED') createProject(project);
  else if (project.status === 'UPDATED') updateProject(project);
  else if (project.status === 'DELETED') removeProject(project);
}

function createProject(project: EntryIndex) {
  const checksums = getChecksums(project.path).map((sum) => {
    sum.status = 'CREATED';
    return sum;
  });
  // console.log(checksums);

  logProjectChanges(project, checksums);
}

function updateProject(project: EntryIndex) {
  logProjectChanges(project, []);
  // TODO
}

function removeProject(project: EntryIndex) {
  logProjectChanges(project, []);
  // TODO
}

function _fetchIndexes(project: EntryIndex): EntryIndex[] {
  const indexFile = join(project.path, INDEX_FILES);
  if (!existsSync(indexFile)) return [];

  const content = readFileSync(indexFile, { encoding: 'utf8' });
  return JSON.parse(content);
}

function _saveIndexes(project: EntryIndex, indexes: EntryIndex[]) {
  const indexFile = join(project.path, INDEX_FILES);
  writeFileSync(indexFile, JSON.stringify(indexes));
}
