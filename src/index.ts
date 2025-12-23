import { existsSync } from 'node:fs';
import { INDEX_FILE } from './constants';
import { connectDB } from './database';
import { fetchIndexes } from './filesystem';
import type { EntryIndex } from './filesystem/types';
import { LOGGER } from './logger';

LOGGER.info(`New instance @ ${new Date()}`);

if (!existsSync(INDEX_FILE)) {
  LOGGER.box(
    'This seems to be the first time you are running this application.\n' +
      'Please read the installation guide in the docs/ folder.',
  );
}

(async () => {
  await connectDB();

  const indexes = fetchIndexes().sort((a, b) => a.path.localeCompare(b.path));

  const created = filterAndPrintIndexes(indexes, 'CREATED');
  const changed = filterAndPrintIndexes(indexes, 'UPDATED');
  const deleted = filterAndPrintIndexes(indexes, 'DELETED');

  function filterAndPrintIndexes(indexes: EntryIndex[], status: EntryIndex['status']) {
    const filteredIndexes = indexes.filter((index) => index.status === status);
    if (filteredIndexes.length === 0) return [];

    // Log all the indexes
    LOGGER.log(`${status}:`);
    for (const index of filteredIndexes) LOGGER.log(` - ${index.path} (${index.hash})`);
    LOGGER.log('');

    return filteredIndexes;
  }
})();
