import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Types } from 'mongoose';
import { INDEX_FILES, TARGET_DIRECTORY } from '../constants';
import { FileModel, ProjectModel } from '../database/schemas';
import type { FileEntry } from '../database/types';
import { resolveIndexes } from '../filesystem';
import type { EntryIndex } from '../filesystem/types';
import { logProjectChanges } from './logging';

type Project = {
  absolutePath: string;
} & EntryIndex;

export async function manageProject(entry: EntryIndex, checksums: EntryIndex[]) {
  const project: Project = {
    absolutePath: resolve(TARGET_DIRECTORY, entry.path),
    ...entry,
  };

  // Let's change the project based on
  // the status change
  if (project.status === 'CREATED') await createProject(project, checksums);
  else if (project.status === 'UPDATED') await updateProject(project, checksums);
  else if (project.status === 'DELETED') await removeProject(project);

  // saveIndexes(project, checksums);
}

async function createProject(project: Project, entries: EntryIndex[]) {
  const checksums = entries.map((sum) => {
    sum.status = 'CREATED';
    return sum;
  });

  logProjectChanges(project, checksums);

  let fileEntries: FileEntry[] = entries.map(processEntry);
  const fileIds: Types.ObjectId[] = [];

  if (fileEntries.length > 0) {
    fileEntries = await FileModel.insertMany(fileEntries);
    fileIds.push(...fileEntries.map((file) => file._id).filter((id) => id != null));
  } else {
    fileEntries = [];
  }

  const { absolutePath, hash, path } = project;
  await ProjectModel.create({ absolutePath, files: fileIds, hash, path });

  const files = fileEntries.map(({ hash, path, _id }) => ({ hash, id: _id?.toString(), path }));
  saveIndexes(project, files);
}

async function updateProject(project: Project, entries: EntryIndex[]) {
  const prevEntries = fetchIndexes(project);
  const entryList = resolveIndexes(prevEntries, entries);

  logProjectChanges(project, entryList);

  // Get unchanged ids
  const projectEntries = entryList.filter(
    ({ status }) => status === 'ORIGINAL' || status === 'UPDATED',
  );

  const fileIds: Types.ObjectId[] = projectEntries
    .map(({ id }) => id || '')
    .filter(Boolean)
    .map(Types.ObjectId.createFromHexString);

  const deletedEntryIds: Types.ObjectId[] = entryList
    .filter(({ status }) => status === 'DELETED')
    .map(({ id }) => id || '')
    .filter(Boolean)
    .map(Types.ObjectId.createFromHexString);

  const createdEntries: FileEntry[] = entryList
    .filter(({ status }) => status === 'CREATED')
    .map(processEntry);

  const changedEntries = entryList
    .filter(({ status, id }) => status === 'UPDATED' && id != null)
    .map(({ id, hash }) => ({ hash, id: Types.ObjectId.createFromHexString(id as string) }));

  if (createdEntries.length > 0) {
    const createdObj = await FileModel.insertMany(createdEntries);
    const createdIds = createdObj.map((file) => file._id);
    fileIds.push(...createdIds);

    const createdFiles = createdObj.map(({ hash, path, _id }) => ({
      hash,
      id: _id?.toString(),
      path,
    }));
    projectEntries.push(...createdFiles);
  }

  if (deletedEntryIds.length > 0) {
    await FileModel.deleteMany({ _id: deletedEntryIds });
  }

  if (changedEntries.length > 0) {
    FileModel.bulkWrite(
      changedEntries.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: {
            $set: { hash: item.hash },
          },
        },
      })),
    );
  }

  const { absolutePath, hash } = project;
  await ProjectModel.updateOne({ absolutePath }, { files: fileIds, hash });

  saveIndexes(project, projectEntries);
}

async function removeProject(project: Project) {
  logProjectChanges(project, []);

  const { absolutePath, path } = project;
  if (existsSync(path)) rmSync(path, { force: true, recursive: true });

  // const fileIds = entries.map(({ id }) => id).map(Types.ObjectId.createFromHexString);
  const fileIds = await ProjectModel.aggregate([{ $match: { absolutePath } }, { $limit: 1 }]);
  if (fileIds[0]?.files != null) await FileModel.deleteMany({ _id: fileIds[0]?.files });
  await ProjectModel.deleteOne({ absolutePath });
}

function processEntry(entry: EntryIndex) {
  const { path, hash } = entry;

  const name = path.split('/').pop();
  const type = (name?.includes('.') ? name.split('.').pop() : 'txt') || 'txt';

  return { changedOn: [], createdOn: new Date(), hash, path, type };
}

function fetchIndexes(project: Project): EntryIndex[] {
  const indexFile = join(project.path, INDEX_FILES);
  if (!existsSync(indexFile)) return [];

  const content = readFileSync(indexFile, { encoding: 'utf8' });
  return JSON.parse(content);
}

function saveIndexes(project: Project, indexes: EntryIndex[]) {
  if (!existsSync(project.path)) mkdirSync(project.path, { recursive: true });
  const indexFile = join(project.path, INDEX_FILES);
  writeFileSync(indexFile, JSON.stringify(indexes));
}
