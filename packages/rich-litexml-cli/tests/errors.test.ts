import { describe, expect, it } from 'vitest';

import { renderMarkdown } from '../src/formats/markdown';
import { detectInputFormat } from '../src/input';
import { parseLiteXmlToState } from '../src/shared/parse-litexml';

describe('error paths', () => {
  it('rejects empty detection input', () => {
    expect(() => detectInputFormat('')).toThrow();
  });

  it('rejects detection of non-XML, non-JSON input', () => {
    expect(() => detectInputFormat('not a markup language')).toThrow(/Cannot detect/);
  });

  it('renders empty markdown for empty doc', () => {
    const state = parseLiteXmlToState('<doc></doc>');
    expect(renderMarkdown(state)).toBe('');
  });
});
