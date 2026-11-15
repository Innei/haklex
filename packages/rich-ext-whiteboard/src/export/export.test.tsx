// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { newElement, newRichTextElement, newTextElement } from '../model/create';
import type { ExcalidrawElement } from '../scene/types';
import { collectFontFaces, expandImports } from './fonts';
import { exportToSvg } from './svg';

const rect = (id: string, x: number, y: number, extra: Record<string, unknown> = {}) =>
  ({
    ...newElement('rectangle', { x, y, width: 100, height: 50 }),
    id,
    ...extra,
  }) as ExcalidrawElement;

const card = {
  ...newRichTextElement({
    x: 300,
    y: 0,
    width: 320,
    height: 80,
    content: {
      root: {
        type: 'root',
        children: [
          { type: 'heading', tag: 'h3', children: [{ type: 'text', text: 'Brew' }] },
          { type: 'paragraph', children: [{ type: 'text', text: 'Ship <it> & rest' }] },
          {
            type: 'list',
            listType: 'number',
            children: [
              { type: 'listitem', children: [{ type: 'text', text: 'first step' }] },
              { type: 'listitem', children: [{ type: 'text', text: 'second step' }] },
            ],
          },
        ],
      },
    },
  }),
  id: 'card',
} as ExcalidrawElement;

describe('exportToSvg', () => {
  it('frames the live elements with padding and a background', async () => {
    const svg = await exportToSvg(
      { elements: [rect('a', 10, 20), rect('gone', 900, 900, { isDeleted: true })] },
      { padding: 10, embedFonts: false },
    );
    expect(svg).toMatch(/^<svg[^>]*xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(svg).toContain('viewBox="0 10 120 70"');
    expect(svg).toMatch(/width="120"[^>]*height="70"|height="70"[^>]*width="120"/);
    expect(svg).toMatch(/<rect[^>]*fill="#ffffff"/);
    expect(svg).toContain('data-id="a"');
    expect(svg).not.toContain('data-id="gone"');
  });

  it('leaves the background out when asked', async () => {
    const svg = await exportToSvg(
      { elements: [rect('a', 0, 0)] },
      { background: null, embedFonts: false },
    );
    expect(svg).not.toMatch(/<rect[^>]*data-export-background/);
  });

  it('draws cards as plain svg text', async () => {
    const svg = await exportToSvg({ elements: [card] }, { embedFonts: false });
    expect(svg).not.toContain('foreignObject');
    expect(svg).toContain('Brew');
    expect(svg).toContain('Ship &lt;it&gt; &amp; rest');
    expect(svg).toContain('first step');
    expect(svg).toMatch(/>1\.</);
    expect(svg).toMatch(/>2\.</);
  });

  it('grows the frame to a card taller than its stored height', async () => {
    const short = { ...card, height: 10 } as ExcalidrawElement;
    const svg = await exportToSvg({ elements: [short] }, { padding: 0, embedFonts: false });
    const height = Number(/viewBox="[\d.-]+ [\d.-]+ [\d.-]+ ([\d.]+)"/.exec(svg)![1]);
    expect(height).toBeGreaterThan(80);
  });

  it('returns an empty frame for an empty scene', async () => {
    const svg = await exportToSvg({ elements: [] }, { embedFonts: false });
    expect(svg).toContain('<svg');
  });
});

describe('collectFontFaces', () => {
  const css = [
    '@font-face { font-family: "LXGW WenKai Screen"; src: url(./a.woff2) format("woff2"); unicode-range: U+4E00-4EFF; }',
    '@font-face { font-family: "LXGW WenKai Screen"; src: url(./b.woff2) format("woff2"); unicode-range: U+0041-005A, U+61-7A; }',
    '@font-face { font-family: "Other"; src: url(./c.woff2); }',
  ].join('\n');

  it('keeps only faces of used families whose range covers used characters', () => {
    const faces = collectFontFaces(css, 'https://cdn.example/fonts/style.css', {
      families: new Set(['lxgw wenkai screen']),
      text: 'hello',
    });
    expect(faces.map((face) => face.url)).toEqual(['https://cdn.example/fonts/b.woff2']);
  });

  it('keeps a face without a unicode-range', () => {
    const faces = collectFontFaces(css, 'https://cdn.example/style.css', {
      families: new Set(['other']),
      text: 'x',
    });
    expect(faces).toHaveLength(1);
  });
});

const text = {
  ...newTextElement({ text: 'plain', fontFamily: 5 }),
  id: 't',
  width: 40,
  height: 25,
};

describe('expandImports', () => {
  it('follows nested @import rules relative to each sheet', async () => {
    const sheets: Record<string, string> = {
      'https://cdn.example/font/a.css':
        '@import "./deep/b.css";\n@font-face { font-family: A; src: url(a.woff2); }',
      'https://cdn.example/font/deep/b.css': '@font-face { font-family: B; src: url(b.woff2); }',
    };
    const sources = await expandImports(
      "@import url('./a.css');\n@import url(./missing.css);",
      'https://cdn.example/font/style.css',
      async (url) => {
        if (!(url in sheets)) throw new Error('404');
        return sheets[url];
      },
    );
    const faces = sources.flatMap((source) =>
      collectFontFaces(source.cssText, source.baseHref, {
        families: new Set(['a', 'b']),
        text: 'x',
      }),
    );
    expect(faces.map((face) => face.url).sort()).toEqual([
      'https://cdn.example/font/a.woff2',
      'https://cdn.example/font/deep/b.woff2',
    ]);
  });
});

describe('export of ordinary text', () => {
  it('keeps text elements as svg text', async () => {
    const svg = await exportToSvg({ elements: [text as ExcalidrawElement] }, { embedFonts: false });
    expect(svg).toContain('plain');
  });
});
