import { URL } from 'url';
import { name as APP_NAME } from '../package.json';

// Import process env variables
const {
  DATABASE_PROTOCOL: dbProtocol,
  DATABASE_URL: dbURL,
  DATABASE_USER: dbUser,
  DATABASE_PASS: dbPass,
  DATABASE_NAME,
  INDEX_FILE: indexFile,
} = process.env;

// Lets generate the url
const urlObject = new URL('http://example.com');
const { searchParams } = urlObject;

urlObject.host = dbURL;
urlObject.username = dbUser;
urlObject.password = dbPass;
urlObject.pathname = DATABASE_NAME;

searchParams.set('appName', APP_NAME);

// Export needed entries
export const DATABASE_URL = urlObject.toString().replace(/^[^:]+/g, dbProtocol || 'mongo');

export const INDEX_FILE = indexFile || 'indexes.json';

export { APP_NAME, DATABASE_NAME };
