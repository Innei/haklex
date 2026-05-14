import { describe, expect, it } from 'vitest';

import { renderMarkdown } from '../src/formats/markdown';
import { parseLiteXmlToState } from '../src/shared/parse-litexml';

function md(xml: string): string {
  return renderMarkdown(parseLiteXmlToState(xml));
}

describe('renderMarkdown', () => {
  it('renders paragraph text', () => {
    expect(md('<doc><p>Hello world</p></doc>')).toContain('Hello world');
  });

  it('renders headings as ATX', () => {
    expect(md('<doc><h1>Title</h1></doc>')).toContain('# Title');
    expect(md('<doc><h2>Sub</h2></doc>')).toContain('## Sub');
  });

  it('renders code blocks as fenced', () => {
    const out = md('<doc><codeblock lang="ts">const a = 1;</codeblock></doc>');
    expect(out).toContain('```');
    expect(out).toContain('const a = 1;');
  });

  it('renders unordered lists', () => {
    const out = md('<doc><ul><li>One</li><li>Two</li></ul></doc>');
    expect(out).toMatch(/[*-]\s+One/);
    expect(out).toMatch(/[*-]\s+Two/);
  });
});
