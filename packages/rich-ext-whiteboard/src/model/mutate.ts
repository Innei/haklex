import { randomInteger } from './random';

interface Versioned {
  updated?: number;
  version?: number;
  versionNonce?: number;
}

export function bumpVersion<T extends Versioned>(el: T, patch: Partial<T> = {}): T {
  return {
    ...el,
    ...patch,
    version: (el.version ?? 0) + 1,
    versionNonce: randomInteger(),
    updated: Date.now(),
  };
}
