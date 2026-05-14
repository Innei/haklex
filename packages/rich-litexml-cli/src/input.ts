import { existsSync, readFileSync } from 'node:fs';

import type { InputFormat } from './shared/types';

export function readInput(input?: string): string {
  if (!input || input === '-') {
    return readFileSync(0, 'utf8');
  }

  if (existsSync(input)) {
    return readFileSync(input, 'utf8');
  }

  return input;
}

export function detectInputFormat(raw: string): InputFormat {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Input is empty.');
  }

  const first = trimmed[0];
  if (first === '<') return 'litexml';
  if (first === '{') return 'json';

  throw new Error(
    'Cannot detect input format. Expected content to start with "<" (LiteXML) or "{" (JSON). ' +
      'Use --input-format to override.',
  );
}
