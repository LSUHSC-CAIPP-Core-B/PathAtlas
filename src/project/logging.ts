import { LogTypes } from 'consola';
import { colors } from 'consola/utils';
import { LIMIT_FILES_TO_LOG } from '../constants';
import type { EntryIndex } from '../filesystem/types';
import { LOGGER, type ReferenceType } from '../logger';

function logEntryChange(
  type: ReferenceType | EntryIndex['status'],
  hash: string,
  path: string,
  isEntry = true,
) {
  const args: string[] = [];
  if (isEntry) args.push(colors.gray('|'));

  // add the coloring
  switch (type) {
    case 'created':
    case 'CREATED':
      args.push(colors.blue('+'));
      break;

    case 'UPDATED':
    case 'updated':
      args.push(colors.yellow('≈'));
      break;

    case 'DELETED':
    case 'removed':
      args.push(colors.red('x'));
      break;

    default:
      // I doubt this will be called
      args.push(colors.blackBright('?'));
  }

  // Add the remaining elements
  args.push(hash, path);

  LOGGER.log({
    args,
    message: '%s %s %s %s',
    type: LogTypes.info,
  });
}

export function logProjectChanges(project: EntryIndex, indexes: EntryIndex[]) {
  const doesOverflow = indexes.length > LIMIT_FILES_TO_LOG;
  const entries = indexes.slice(0, LIMIT_FILES_TO_LOG);

  const projectHash = project.hash.slice(-8);
  logEntryChange(project.status, colors.gray(projectHash), project.path, false);

  for (const entry of entries) {
    const hash = entry.hash.slice(-8);
    logEntryChange(entry.status, colors.gray(hash), entry.path);
  }

  if (doesOverflow) {
    LOGGER.log({
      args: [colors.gray('|'), colors.gray(`and ${indexes.length - LIMIT_FILES_TO_LOG} others`)],
      message: '%s %s',
      type: LogTypes.info,
    });
  }
}
