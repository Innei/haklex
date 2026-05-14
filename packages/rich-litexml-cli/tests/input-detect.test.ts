import { describe, expect, it } from 'vitest';

import { detectInputFormat } from '../src/input';

describe('detectInputFormat', () => {
  it('detects LiteXML by leading "<"', () => {
    expect(detectInputFormat('<p>Hello</p>')).toBe('litexml');
    expect(detectInputFormat('  \n<doc></doc>')).toBe('litexml');
  });

  it('detects JSON by leading "{"', () => {
    expect(detectInputFormat('{"root":{}}')).toBe('json');
    expect(detectInputFormat('  \n{"root":{}}')).toBe('json');
  });

  it('throws on empty input', () => {
    expect(() => detectInputFormat('')).toThrow(/empty/);
    expect(() => detectInputFormat('   \n\t')).toThrow(/empty/);
  });

  it('throws on ambiguous input', () => {
    expect(() => detectInputFormat('hello world')).toThrow(/Cannot detect/);
    expect(() => detectInputFormat('[1,2,3]')).toThrow(/Cannot detect/);
  });
});
