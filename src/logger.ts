import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { createConsola } from 'consola';
import { stripAnsi } from 'consola/utils';

export const LOGGER = createConsola();

function formatNumber(digit: number) {
  return `${digit}`.padStart(2, '0');
}

function getDateString(date = new Date()) {
  const year = date.getFullYear(),
    month = date.getMonth() + 1,
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
  const TOTAL_PADDING = 9,
    ALLOWED_PADDING = Math.max(TOTAL_PADDING - type.length, 0),
    START_PADDING = ' '.repeat(Math.floor(ALLOWED_PADDING / 2)),
    END_PADDING = ' '.repeat(ALLOWED_PADDING - START_PADDING.length);

  return `${START_PADDING}${type.toUpperCase()}${END_PADDING}`;
}

function formatArg(arg: any) {
  const output = typeof arg === 'string' ? arg : JSON.stringify(arg);
  return stripAnsi(output);
}

function formatContent(args: any[], options: Record<string, any>): string {
  if (!(args?.length > 0)) return null;

  let output = args.map(formatArg).join('\n');

  if (typeof args[0] === 'string') {
    let content: string = args.shift();
    const _args = args.map(formatArg);

    while (_args.length > 0) {
      if (content.includes('%s')) {
        const firstIndex = content.indexOf('%s');
        content = content.slice(0, firstIndex) + _args.shift() + content.slice(firstIndex + 2);
        continue;
      }
      content = content.concat(' ', _args.shift());
    }

    output = content.trim();
  }

  const prefix = (options?.prefix as string) ?? '';
  const suffix = (options?.suffix as string) ?? '';
  const insertStart = (options?.insertStart as string[])?.join('\n')?.concat('\n') ?? '';
  const insertEnd = (options?.insertEnd as string[])?.join('\n')?.concat('\n') ?? '';

  return ''
    .concat(insertStart, output, '\n', insertEnd)
    .replace(/(?:^|(?<=\n))(?!$)/gi, prefix)
    .replace(/(?:(?=\n))(?!$)/gi, suffix);
}

LOGGER.addReporter({
  log(logObj) {
    const date = new Date(),
      file = getDateString(date),
      time = getTimestamp(date),
      type = fornatType(logObj.type),
      isBox = logObj.type.toLowerCase() === 'box',
      boxReminders = ['----------------'];

    const prefix = `[${type}][${time}] `,
      suffix = '',
      insertStart = isBox ? boxReminders : null,
      insertEnd = isBox ? boxReminders : null;

    const content = formatContent(logObj.args, { insertEnd, insertStart, prefix, suffix });
    if (content == null) return;

    if (!existsSync('logs/')) mkdirSync('logs/');
    appendFileSync(`logs/${file}.log`, content, { encoding: 'utf8' });
  },
});

export type ReferenceType = 'created' | 'updated' | 'removed';
