import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { createConsola } from 'consola';

export const LOGGER = createConsola();

function formatNumber(digit: number) {
  return `${digit}`.padStart(2, '0');
}

function getDateString(date = new Date()) {
  const year = date.getFullYear(),
    month = date.getMonth(),
    day = date.getDate();

  return [year, month, day].map(formatNumber).join('-');
}

function getTimestamp(date = new Date()) {
  const hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds();

  return [hours, minutes, seconds].map(formatNumber).join(':');
}

function fornatType(type: string) {
  const TOTAL_PADDING = 10,
    ALLOWED_PADDING = Math.max(TOTAL_PADDING - type.length, 0),
    START_PADDING = ' '.repeat(Math.ceil(ALLOWED_PADDING / 2)),
    END_PADDING = ' '.repeat(ALLOWED_PADDING - START_PADDING.length);

  return `${START_PADDING}${type.toUpperCase()}${END_PADDING}`;
}

function formatArg(arg: any) {
  return typeof arg === 'string' ? arg : JSON.stringify(arg);
}

LOGGER.addReporter({
  log(logObj) {
    const date = new Date(),
      file = getDateString(date),
      time = getTimestamp(date),
      type = fornatType(logObj.type);

    const args = logObj.args
      .map(formatArg)
      .join('\n')
      .split('\n')
      .map((arg) => `[${type}][${time}] ${arg}\n`);

    if (!existsSync('logs/')) mkdirSync('logs/');
    appendFileSync(`logs/${file}.log`, args.join(''), { encoding: 'utf8' });
  },
});
