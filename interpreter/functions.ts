import type { SingleOrArray } from './types';
import { default as names } from '../nameMap.json';

/**
 * Adds a space between each pascal case word
 * @param str A pascal case string or an array of pascal case string
 * @returns Friendly format
 */
export function spacePascalCase (str: string): string;
export function spacePascalCase (str: string[]): string[];
export function spacePascalCase (str: SingleOrArray<string>) {
  const replace = (s: string) => s.replace(/([a-z])(?=[A-Z0-9])/g, '$1 ');

  return Array.isArray(str)
    ? str.map(s => replace(s))
    : replace(str);
}

/**
 * Converts a timestamp in milliseconds to a formatted timestamp
 * @param timestamp A timestamp in milliseconds
 * @returns A formatted timestamp representing the given time
 */
export function timeDelta (timestamp: number) {
  const ms = Math.round(timestamp);

  if (!ms) return '0ms';

  const absMS = Math.abs(ms);
  const units = [
    { name: 'y', ms: 31536e6 },
    { name: 'mo', ms: 2628e6 },
    { name: 'd', ms: 864e5 },
    { name: 'h', ms: 36e5 },
    { name: 'm', ms: 6e4 },
    { name: 's', ms: 1e3 },
    { name: 'ms', ms: 1 }
  ];

  const arr = [];

  arr.push(Math.floor(absMS / units[0].ms) + units[0].name);

  for (let i = 0; i < units.length - 1; i++) {
    arr.push(Math.floor(absMS % units[i].ms / units[i + 1].ms) + units[i + 1].name);
  }

  const timeArray = arr.filter(g => !g.startsWith('0'));
  const last = timeArray.pop();

  return [timeArray.join(', '), last].filter(str => str).join(' and ') + (ms < 0 ? ' ago' : '');
}

/**
 * Converts a timestamp in milliseconds to YYYY-MM-DD hrs:mins:secs UTC
 * @param unix A unix timestamp in milliseconds
 * @returns A formatted timestamp
 */
export function parseUTCDate (unix = Date.now()) {
  const date = new Date(unix);

  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()} UTC`;
}

/**
 * Resolves a snowflake to `name` (`id`) format, returns `id` if id not found
 * @param id Snowflake
 * @returns `name` (`id`) or `id`
 */
export function resolveName (id: string | null) {
  const name = (names as Record<string, string>)[id ?? ''];

  return name
    ? `\`${name}\` (\`${id}\`)`
    : `\`${id}\``;
}
