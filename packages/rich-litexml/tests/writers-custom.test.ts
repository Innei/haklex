import type { SerializedEditorState } from 'lexical';
import { describe, expect, it } from 'vitest';

import { LitexmlRegistry } from '../src/registry';
import { serializeToXml } from '../src/serializer';
import { registerBuiltinWriters } from '../src/writers/builtin';
import { registerCustomWriters } from '../src/writers/custom';

function makeState(children: any[]): SerializedEditorState {
  return {
    root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 },
  } as SerializedEditorState;
}

function serialize(children: any[]): string {
  const registry = new LitexmlRegistry();
  registerBuiltinWriters(registry);
  registerCustomWriters(registry);
  return serializeToXml(makeState(children), registry);
}

describe('custom writers', () => {
  // Pattern A: simple attributes
  it('image', () => {
    const xml = serialize([
      {
        type: 'image',
        $: { blockId: 'img1' },
        src: '/photo.jpg',
        altText: 'A photo',
        width: 800,
        height: 600,
        version: 1,
      },
    ]);
    expect(xml).toContain(
      '<img id="img1" src="/photo.jpg" alt="A photo" width="800" height="600" />',
    );
  });

  it('image with displayWidth and layout', () => {
    const xml = serialize([
      {
        type: 'image',
        $: { blockId: 'img2' },
        src: '/photo.jpg',
        altText: 'A photo',
        displayWidth: 60,
        layout: 'float-right',
        version: 1,
      },
    ]);
    expect(xml).toContain('display-width="60"');
    expect(xml).toContain('layout="float-right"');
  });

  it('image without displayWidth and layout omits the attributes', () => {
    const xml = serialize([{ type: 'image', src: '/photo.jpg', altText: 'A photo', version: 1 }]);
    expect(xml).not.toContain('display-width');
    expect(xml).not.toContain('layout');
  });

  it('video', () => {
    const xml = serialize([
      {
        type: 'video',
        $: { blockId: 'v1' },
        src: '/clip.mp4',
        poster: '/thumb.jpg',
        version: 1,
      },
    ]);
    expect(xml).toContain('<video id="v1" src="/clip.mp4" poster="/thumb.jpg" />');
  });

  it('link-card', () => {
    const xml = serialize([
      {
        type: 'link-card',
        $: { blockId: 'lc1' },
        url: 'https://example.com',
        title: 'Example',
        version: 1,
      },
    ]);
    expect(xml).toContain('<link-card id="lc1" url="https://example.com" title="Example" />');
  });

  it('embed', () => {
    const xml = serialize([
      {
        type: 'embed',
        $: { blockId: 'e1' },
        url: 'https://youtube.com/watch?v=123',
        source: 'youtube',
        version: 1,
      },
    ]);
    expect(xml).toContain(
      '<embed id="e1" url="https://youtube.com/watch?v=123" source="youtube" />',
    );
  });

  // Pattern B: text content
  it('code-block', () => {
    const xml = serialize([
      {
        type: 'code-block',
        $: { blockId: 'cb1' },
        code: 'const x = 1',
        language: 'ts',
        version: 1,
      },
    ]);
    expect(xml).toContain('<codeblock id="cb1" lang="ts">const x = 1</codeblock>');
  });

  it('mermaid', () => {
    const xml = serialize([
      {
        type: 'mermaid',
        $: { blockId: 'm1' },
        diagram: 'graph LR\n  A-->B',
        version: 1,
      },
    ]);
    expect(xml).toContain('<mermaid id="m1">graph LR\n  A--&gt;B</mermaid>');
  });

  it('katex-block', () => {
    const xml = serialize([
      {
        type: 'katex-block',
        $: { blockId: 'kb1' },
        equation: 'E=mc^2',
        version: 1,
      },
    ]);
    expect(xml).toContain('<math id="kb1" display="block">E=mc^2</math>');
  });

  it('katex-inline within paragraph', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'text',
            text: 'Energy is ',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
          { type: 'katex-inline', equation: 'E=mc^2', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('Energy is <math>E=mc^2</math>');
  });

  it('katex-inline with color attribute', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [{ type: 'katex-inline', equation: 'E=mc^2', color: '#ef4444', version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<math color="#ef4444">E=mc^2</math>');
  });

  // Pattern C: nested EditorState
  it('alert-quote', () => {
    const xml = serialize([
      {
        type: 'alert-quote',
        $: { blockId: 'aq1' },
        alertType: 'warning',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Be careful',
                    format: 0,
                    detail: 0,
                    mode: 'normal',
                    style: '',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        version: 1,
      },
    ]);
    expect(xml).toContain('<alert id="aq1" type="warning">');
    expect(xml).toContain('<p>Be careful</p>');
    expect(xml).toContain('</alert>');
  });

  // Pattern D: element with children
  it('details', () => {
    const xml = serialize([
      {
        type: 'details',
        $: { blockId: 'd1' },
        summary: 'Click me',
        open: true,
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'hidden content',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    ]);
    expect(xml).toContain('<details id="d1" summary="Click me" open="true">');
    expect(xml).toContain('<p>hidden content</p>');
    expect(xml).toContain('</details>');
  });

  // Pattern E: inline
  it('mention', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'text',
            text: 'Hi ',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
          {
            type: 'mention',
            platform: 'github',
            handle: 'innei',
            displayName: 'Innei',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('Hi <mention platform="github" handle="innei">Innei</mention>');
  });

  it('tag', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          { type: 'tag', text: 'AI', format: 0, detail: 0, mode: 'normal', style: '', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<tag>AI</tag>');
  });

  it('spoiler', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'spoiler',
            children: [
              {
                type: 'text',
                text: 'secret',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<spoiler>secret</spoiler>');
  });

  it('ruby', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'ruby',
            reading: 'きょう',
            children: [
              {
                type: 'text',
                text: '今日',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<ruby rt="きょう">今日</ruby>');
  });

  it('footnote', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'text',
            text: 'text',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
          { type: 'footnote', identifier: '1', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('text<footnote ref="1" />');
  });

  it('footnote-section', () => {
    const xml = serialize([
      {
        type: 'footnote-section',
        $: { blockId: 'fs1' },
        definitions: { '1': 'First note', '2': 'Second note' },
        version: 1,
      },
    ]);
    expect(xml).toContain('<footnote-section id="fs1">');
    expect(xml).toContain('<def ref="1">First note</def>');
    expect(xml).toContain('<def ref="2">Second note</def>');
  });

  it('gallery', () => {
    const xml = serialize([
      {
        type: 'gallery',
        $: { blockId: 'g1' },
        images: [
          { src: '/a.jpg', alt: 'A' },
          { src: '/b.jpg', alt: 'B' },
        ],
        layout: 'grid',
        version: 1,
      },
    ]);
    expect(xml).toContain('<gallery id="g1" layout="grid">');
    expect(xml).toContain('<img src="/a.jpg" alt="A" />');
    expect(xml).toContain('<img src="/b.jpg" alt="B" />');
  });

  it('gallery with non-default aspect, fit, and maxItemHeight', () => {
    const xml = serialize([
      {
        type: 'gallery',
        $: { blockId: 'g1' },
        images: [{ src: '/a.jpg', alt: 'A' }],
        layout: 'masonry',
        aspect: '16:9',
        fit: 'contain',
        maxItemHeight: 480,
        version: 1,
      },
    ]);
    expect(xml).toContain(
      '<gallery id="g1" layout="masonry" aspect="16:9" fit="contain" max-item-height="480">',
    );
  });

  it('gallery writes aspect and fit at their defaults, omits unset maxItemHeight', () => {
    const xml = serialize([
      {
        type: 'gallery',
        images: [{ src: '/a.jpg', alt: 'A' }],
        layout: 'grid',
        aspect: 'auto',
        fit: 'cover',
        version: 1,
      },
    ]);
    expect(xml).toContain('<gallery layout="grid" aspect="auto" fit="cover">');
    expect(xml).not.toContain('max-item-height');
  });

  it('excalidraw', () => {
    const xml = serialize([
      {
        type: 'excalidraw',
        $: { blockId: 'ex1' },
        snapshot: '{"elements":[]}',
        version: 1,
      },
    ]);
    expect(xml).toContain('<excalidraw id="ex1"><![CDATA[{"elements":[]}]]></excalidraw>');
  });

  it('excalidraw remote URL snapshot writes as plain text', () => {
    const xml = serialize([
      {
        type: 'excalidraw',
        $: { blockId: 'ex1' },
        snapshot: 'https://cdn.example.com/diagram.excalidraw',
        version: 1,
      },
    ]);
    expect(xml).toContain(
      '<excalidraw id="ex1">https://cdn.example.com/diagram.excalidraw</excalidraw>',
    );
    expect(xml).not.toContain('CDATA');
  });

  it('excalidraw empty snapshot', () => {
    const xml = serialize([
      {
        type: 'excalidraw',
        $: { blockId: 'ex2' },
        snapshot: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<excalidraw id="ex2" />');
  });

  it('dynamic with props', () => {
    const xml = serialize([
      {
        type: 'dynamic',
        $: { blockId: 'dyn1' },
        url: 'https://cdn.example.com/widget.mjs',
        props: { level: 1 },
        initialHeight: 480,
        version: 1,
      },
    ]);
    expect(xml).toContain(
      '<dynamic id="dyn1" url="https://cdn.example.com/widget.mjs" initial-height="480"><![CDATA[{"level":1}]]></dynamic>',
    );
  });

  it('dynamic without props is self-closing', () => {
    const xml = serialize([
      {
        type: 'dynamic',
        $: { blockId: 'dyn2' },
        url: 'https://cdn.example.com/widget.mjs',
        props: {},
        initialHeight: 320,
        version: 1,
      },
    ]);
    expect(xml).toContain(
      '<dynamic id="dyn2" url="https://cdn.example.com/widget.mjs" initial-height="320" />',
    );
  });

  it('grid-container', () => {
    const xml = serialize([
      {
        type: 'grid-container',
        $: { blockId: 'g1' },
        cols: 2,
        gap: '16px',
        cells: [
          {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Cell A',
                      format: 0,
                      detail: 0,
                      mode: 'normal',
                      style: '',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  textFormat: 0,
                  textStyle: '',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Cell B',
                      format: 0,
                      detail: 0,
                      mode: 'normal',
                      style: '',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  textFormat: 0,
                  textStyle: '',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        ],
        version: 1,
      },
    ]);
    expect(xml).toContain('<grid id="g1" cols="2" gap="16px">');
    expect(xml).toContain('<cell>');
    expect(xml).toContain('<p>Cell A</p>');
    expect(xml).toContain('<p>Cell B</p>');
    expect(xml).toContain('</grid>');
  });

  it('agent-diff', () => {
    const xml = serialize([
      {
        type: 'agent-diff',
        $: { blockId: 'ad1' },
        opType: 'replace',
        diffEntryId: 'diff-123',
        version: 1,
      },
    ]);
    expect(xml).toContain('<agent-diff id="ad1" op="replace" entry="diff-123" />');
  });

  it('code-snippet', () => {
    const xml = serialize([
      {
        type: 'code-snippet',
        $: { blockId: 'cs1' },
        files: [
          { filename: 'index.ts', code: 'export {}', language: 'ts' },
          { filename: 'main.ts', code: 'console.log(1)', language: 'ts' },
        ],
        version: 1,
      },
    ]);
    expect(xml).toContain('<code-snippet id="cs1">');
    expect(xml).toContain('<file name="index.ts" lang="ts">export {}</file>');
    expect(xml).toContain('<file name="main.ts" lang="ts">console.log(1)</file>');
  });

  it('comment', () => {
    const xml = serialize([
      {
        type: 'paragraph',
        $: { blockId: 'p1' },
        children: [
          {
            type: 'comment',
            text: 'a comment',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ]);
    expect(xml).toContain('<comment>a comment</comment>');
  });

  it('poll', () => {
    const xml = serialize([
      {
        type: 'poll',
        $: { blockId: 'pl1' },
        pollId: 'p_abc',
        question: 'Which one?',
        options: [
          { id: 'o_a', label: 'Option A' },
          { id: 'o_b', label: 'Option B' },
        ],
        mode: 'multiple',
        closeAt: '2026-05-01T00:00:00Z',
        showResults: 'after-vote',
        version: 1,
      },
    ]);
    expect(xml).toContain(
      '<poll id="pl1" poll-id="p_abc" mode="multiple" close-at="2026-05-01T00:00:00Z" show-results="after-vote">',
    );
    expect(xml).toContain('<question>Which one?</question>');
    expect(xml).toContain('<option id="o_a">Option A</option>');
    expect(xml).toContain('<option id="o_b">Option B</option>');
  });
});
