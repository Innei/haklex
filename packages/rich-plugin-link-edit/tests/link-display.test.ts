import { describe, expect, it } from 'vitest';

import { isEmptyLink, middleTruncate } from '../src/link-display';

describe('middleTruncate', () => {
  it('leaves short text alone', () => {
    expect(middleTruncate('example.com', 20)).toBe('example.com');
  });

  it('keeps the start and the end around a single ellipsis', () => {
    const out = middleTruncate('https://example.com/docs/guides/getting-started/install', 24);
    expect(out).toHaveLength(24);
    expect(out.startsWith('https://exam')).toBe(true);
    expect(out.endsWith('install')).toBe(true);
    expect(out.match(/…/g)).toHaveLength(1);
  });
});

describe('isEmptyLink', () => {
  it('treats blank and bare-protocol URLs as empty', () => {
    expect(isEmptyLink('')).toBe(true);
    expect(isEmptyLink('  ')).toBe(true);
    expect(isEmptyLink('https://')).toBe(true);
    expect(isEmptyLink('http://')).toBe(true);
  });

  it('treats any real address as filled', () => {
    expect(isEmptyLink('https://a.co')).toBe(false);
    expect(isEmptyLink('/docs')).toBe(false);
  });
});
