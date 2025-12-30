import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { INDEX_FILES } from '../constants';
import { FileModel, ProjectModel } from '../database/schemas';
import type { FileEntry } from '../database/types';
import { resolveIndexes } from '../filesystem';
import { getChecksums } from '../filesystem/processes';
import type { EntryIndex } from '../filesystem/types';
import { logProjectChanges } from './logging';

type Project = {
  absolutePath: string;
} & EntryIndex;

export async function manageProject(entry: EntryIndex) {
  const project: Project = {
    absolutePath: resolve(entry.path),
    ...entry,
  };

  const parentPathRegExp = new RegExp(`^${entry.path}/?`, 'gi');

  // console.log(project);
  const checksums: EntryIndex[] =
    project.status === 'DELETED' || project.status === 'ORIGINAL'
      ? []
      : getChecksums(project.path).map((sum) => {
          sum.path = sum.path.replace(parentPathRegExp, '');
          return sum;
        });

  if (project.status === 'CREATED') await createProject(project, checksums);
  else if (project.status === 'UPDATED') await updateProject(project, checksums);
  else if (project.status === 'DELETED') await removeProject(project, checksums);

  // saveIndexes(project, checksums);
}

async function createProject(project: Project, entries: EntryIndex[]) {
  const checksums = entries.map((sum) => {
    sum.status = 'CREATED';
    return sum;
  });

  logProjectChanges(project, checksums);

  return;

  // TODO: Fix the issue with insertMany timing out

  const createdOn = new Date();

  const fileEntries: FileEntry[] = entries.map((entry) => {
    const { path } = entry;
    const type = path.replace(/^(?:[^.]+\.)+/gi, '');

    return { changedOn: [], createdOn, path, type };
  });

  const filesObj = await FileModel.insertMany(fileEntries);
  const fileIds = filesObj.map((file) => file._id);

  const { absolutePath, hash, path } = project;
  const projectObj = await ProjectModel.create({ absolutePath, files: fileIds, hash, path });
}

async function updateProject(project: Project, entries: EntryIndex[]) {
  const prevEntries = fetchIndexes(project);
  const entryList = resolveIndexes(prevEntries, entries);

  logProjectChanges(project, entryList);

  // TODO
}

async function removeProject(project: Project, entries: EntryIndex[]) {
  logProjectChanges(project, []);
  // TODO
}

function fetchIndexes(project: Project): EntryIndex[] {
  const indexFile = join(project.path, INDEX_FILES);
  if (!existsSync(indexFile)) return [];

  const content = readFileSync(indexFile, { encoding: 'utf8' });
  return JSON.parse(content);
}

function saveIndexes(project: Project, indexes: EntryIndex[]) {
  const indexFile = join(project.path, INDEX_FILES);
  writeFileSync(indexFile, JSON.stringify(indexes));
}
