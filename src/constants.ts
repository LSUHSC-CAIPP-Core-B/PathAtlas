import { URL } from 'url';
import { name as APP_NAME } from '../package.json';

// Import process env variables
const {
  DATABASE_PROTOCOL: dbProtocol,
  DATABASE_URL,
  DATABASE_USER,
  DATABASE_PASS,
  DATABASE_NAME,
  TARGET_DIRECTORY: targetFolder,
  INDEX_FILES: indexFile,
  LIMIT_FILES_TO_LOG: fileLogLimit,
} = process.env;

// Lets generate the url
const urlObject = new URL('http://example.com');
const { searchParams } = urlObject;

urlObject.host = DATABASE_URL;
urlObject.pathname = DATABASE_NAME;

searchParams.set('appName', APP_NAME);
// searchParams.set('authSource', 'admin');

let _logLimit = 10;
try {
  _logLimit = parseInt(fileLogLimit || '10');
} catch (_ignored) {}

export const LIMIT_FILES_TO_LOG = _logLimit;

// Export needed entries
export const COMPLETE_DATABASE_URL = urlObject.toString().replace(/^[^:]+/g, dbProtocol || 'mongo');

export const INDEX_FILES = indexFile || 'indexes.json';
export const TARGET_DIRECTORY = targetFolder || '.';

export { APP_NAME, DATABASE_NAME, DATABASE_USER, DATABASE_PASS, DATABASE_URL };
