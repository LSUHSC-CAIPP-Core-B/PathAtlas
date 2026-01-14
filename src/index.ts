import { existsSync } from 'node:fs';
import mri from 'mri';
import { INDEX_FILES } from './constants';
import { connectDB, disconnectDB } from './database';
import { fetchIndexes } from './filesystem';
import { getChecksums } from './filesystem/processes';
import type { EntryIndex } from './filesystem/types';
import { LOGGER } from './logger';
import { manageProject } from './project';

(async () => {
  const STARTUP_ARGS = mri(process.argv.slice(2));
  const { _: PROJECTS } = STARTUP_ARGS;

  // Log a new instance
  LOGGER.log('');
  LOGGER.info(`New instance @ ${new Date()}`);

  // Display first time message
  if (!existsSync(INDEX_FILES)) {
    LOGGER.box(
      'This seems to be the first time you are running this application.\n' +
        'Please read the installation guide in the docs/ folder.',
    );
  }

  // Let's validate projects before checking
  // if (PROJECTS)

  // Fetch all the changes since last run
  LOGGER.start('Fetching project changes');

  // Let's get the checksums for the directories
  // that we are filtering for.
  const groupedIndexes: Record<string, EntryIndex[]> = getChecksums(PROJECTS) || {};

  // Let's find all the "checked" indexes, weather
  // skipped or looked over.
  const checkedIndexes = fetchIndexes(groupedIndexes, PROJECTS).sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  // Let's get all the changed indexes.
  const changedIndexes = checkedIndexes.filter((a) => a.status !== 'ORIGINAL');
  LOGGER.success(`Found %s projects!`, checkedIndexes.length);

  LOGGER.log('');
  if (changedIndexes.length === 0) {
    // If no changes were made, let's exit
    LOGGER.info(`No projects have been updated!`);
    return;
  }

  LOGGER.success(`Found %s updated projects!`, changedIndexes.length);

  // Start the database so we can sync
  // all the changes that have been made
  LOGGER.log('');
  await connectDB();

  // Start the syncing process
  LOGGER.log('');
  LOGGER.start('Syncing changes...');

  for (const changed of changedIndexes) {
    const path = changed.path.replace(/\/$/gi, '');
    await manageProject(changed, groupedIndexes[path]);
  }

  LOGGER.log('');
  LOGGER.success('Synced changes!');
  LOGGER.info('Exiting...');

  await disconnectDB();
})();
