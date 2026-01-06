import { existsSync } from 'node:fs';
import { INDEX_FILES } from './constants';
import { connectDB, disconnectDB } from './database';
// import { connectDB } from './database';
import { fetchIndexes } from './filesystem';
import { LOGGER } from './logger';
import { manageProject } from './project';

(async () => {
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

  // Fetch all the changes since last run
  LOGGER.start('Fetching project changes');
  const indexes = fetchIndexes().sort((a, b) => a.path.localeCompare(b.path));
  const changedIndexes = indexes.filter((a) => a.status !== 'ORIGINAL');
  LOGGER.success(`Found %s projects!`, indexes.length);

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

  for (const changed of changedIndexes) await manageProject(changed);

  LOGGER.log('');
  LOGGER.success('Synced changes!');
  LOGGER.info('Exiting...');

  await disconnectDB();
})();
