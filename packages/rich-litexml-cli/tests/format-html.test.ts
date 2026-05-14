import { existsSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { renderHtml } from '../src/formats/html';
import { parseLiteXmlToState } from '../src/shared/parse-litexml';

const composeDist = path.resolve(
  __dirname,
  '../../rich-compose/dist/litexml-html-preview-client.js',
);
const hasAssets = existsSync(composeDist);

describe.skipIf(!hasAssets)('renderHtml', () => {
  it('emits a self-contained HTML document', () => {
    const state = parseLiteXmlToState('<doc><p>Hello</p></doc>');
    const out = renderHtml(state, {
      lang: 'en',
      theme: 'light',
      variant: 'article',
    });
    expect(out).toMatch(/^<!doctype html>/);
    expect(out).toContain('haklex-litexml-payload');
    expect(out).toContain('"state":');
    expect(out).not.toContain('"xml":');
  });

  it('reflects theme + variant in payload', () => {
    const state = parseLiteXmlToState('<doc><p>Hi</p></doc>');
    const out = renderHtml(state, {
      lang: 'zh',
      theme: 'dark',
      variant: 'note',
    });
    expect(out).toContain('<html lang="zh">');
    expect(out).toContain('color-scheme: dark');
    expect(out).toContain('"theme":"dark"');
    expect(out).toContain('"variant":"note"');
  });

  it('escapes the user-provided title', () => {
    const state = parseLiteXmlToState('<doc><p>Hi</p></doc>');
    const out = renderHtml(state, {
      lang: 'en',
      theme: 'light',
      title: 'My <Article> & "demo"',
      variant: 'article',
    });
    expect(out).toContain('<title>My &lt;Article&gt; &amp; &quot;demo&quot;</title>');
  });
});

describe.skipIf(hasAssets)('renderHtml without compose dist', () => {
  it('throws a friendly error directing the user to build rich-compose', () => {
    const state = parseLiteXmlToState('<doc><p>Hi</p></doc>');
    expect(() => renderHtml(state, { lang: 'en', theme: 'light', variant: 'article' })).toThrow(
      /rich-compose/,
    );
  });
});
