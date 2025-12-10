import { DATABASE_URL } from './constants';
import { getChanges, getReference } from './filesystem';

console.log(DATABASE_URL);

getReference();
(async () => {
  await getChanges();
})();
