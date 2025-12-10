import { createHash } from 'node:crypto';
import {
  createReadStream,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join as joinPath } from 'node:path';
import { INDEX_FILE } from '../constants';
import type { DeepReadonly } from '../types';
import type { Reference } from './types';

const defaultRef: Reference = { ignored: [], packed: {} };
let options: Reference = null;

export function getReference(): DeepReadonly<Reference> {
  if (options == null) options = createOrLoadReference();

  return Object.freeze(options);
}

function deepCopy<T>(data: unknown): T {
  return JSON.parse(JSON.stringify(data));
}

function createOrLoadReference(): Reference {
  if (existsSync(INDEX_FILE)) {
    const content = readFileSync(INDEX_FILE, { encoding: 'utf8' });
    return JSON.parse(content);
  }

  const ignored = readdirSync('./', {
    encoding: 'utf8',
    recursive: false,
    withFileTypes: true,
  }).map((data) => data.name);

  ignored.push(INDEX_FILE);
  return saveReference({ ignored, packed: {} });
}

function saveReference(reference: Reference) {
  const content = JSON.stringify(options, null, 2);
  writeFileSync(INDEX_FILE, content, { encoding: 'utf8' });
  return reference;
}

async function hasChanged(fileName: string, ref: Reference = defaultRef) {
  if (ref[fileName]) {
    const hash = await getHash(fileName);
    if (ref[fileName] !== hash) return fileName;
  }

  return null;
}

function getChangedFiles(
  includeFiles: boolean = false,
  ref: Reference = defaultRef,
): Promise<string[]> {
  const files = readdirSync('./', { encoding: 'utf8', recursive: false, withFileTypes: true })
    .filter((file) => file.isDirectory() || includeFiles)
    .filter((file) => !ref.ignored.includes(file.name))
    .map((file) => file.name);

  const missingFiles = Object.keys(ref.packed).filter((file) => files.includes(file));

  const changes = files.map((fileName) => hasChanged(fileName, ref));

  return Promise.all(changes)
    .then((files) => files.filter((file) => file != null))
    .then((files) => files.concat(...missingFiles));
}

// TODO: Make the lookup include:
// - file name
// - file path
// - hash
// - type

export async function getChanges() {
  const oldRef = getReference();
  const changed = await getChangedFiles(false, oldRef as Reference);

  console.log(changed);

  const newRef: Reference = deepCopy(oldRef);
}

function getHash(fileName: string, algorithm = 'sha256'): Promise<string> {
  return statSync(fileName).isFile()
    ? getFileHash(fileName, algorithm)
    : getDirectoryHash(fileName, algorithm);
}

function getFileHash(filePath: string, algorithm = 'sha256'): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm);
    const stream = createReadStream(filePath);
    stream.on('data', hash.update);
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

function getDirectoryHash(filePath: string, algorithm = 'sha256'): Promise<string> {
  const hashPromises = readdirSync(filePath, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((file) => getHash(joinPath(filePath, file.name), algorithm));

  return Promise.all(hashPromises).then((hashes: string[]) => {
    const hash = createHash(algorithm);
    for (const h of hashes) hash.update(h);
    return hash.digest('hex');
  });
}
