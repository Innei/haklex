import { describe, expect, it } from 'vitest';

import { inDarkScheme } from '../src/scheme';

describe('inDarkScheme', () => {
  it('matches a dark ancestor unless a light scope sits between it and the target', () => {
    expect(inDarkScheme('.card span')).toBe(
      "[data-theme='dark'] .card span:not([data-theme='dark'] [data-theme='light'] *), " +
        "[data-theme='light'] [data-theme='dark'] .card span",
    );
  });

  it('expands every selector in a list', () => {
    expect(inDarkScheme('.a, .b').split(', ')).toHaveLength(4);
  });
});
