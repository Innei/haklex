// @vitest-environment happy-dom
import type { LexicalEditor, TextNode } from 'lexical';
import { $getRoot } from 'lexical';
import { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { doubleClick, mountEditor } from '../../tests/harness';
import { pasteFromClipboard } from '../editor/clipboard-actions';
import { createWhiteboardStore } from '../editor/store';
import { serializeClipboard } from '../model/clipboard';
import { richTextPlainText } from '../model/richtext';
import { toEditableContent } from '../model/richtext-editable';
import { measureRichTextHeight } from '../model/richtext-layout';
import { computeSceneBounds, SceneContent } from '../scene/Scene';
import type { ExcalidrawElement, RichTextElement } from '../scene/types';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const CONTENT = {
  root: {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Brew' }] }],
  },
};

const minimalCard = (extra: Record<string, unknown> = {}) =>
  ({
    id: 'c',
    type: 'richtext',
    x: 0,
    y: 0,
    width: 160,
    height: 100,
    content: CONTENT,
    ...extra,
  }) as unknown as ExcalidrawElement;

const render = (el: ExcalidrawElement) =>
  renderToStaticMarkup(
    <svg>
      <SceneContent scene={{ elements: [el] }} />
    </svg>,
  );

describe('cards written with only the required fields', () => {
  it('draw with the card defaults in the read-only view', () => {
    const html = render(minimalCard());
    expect(html).not.toContain('NaN');
    expect(html).toContain('fill="#ffec99"');
  });

  it('draw a solid body when fillStyle and seed are left out', () => {
    const html = render(minimalCard({ backgroundColor: '#f2bcd3' }));
    expect(html).toMatch(/<path[^>]*fill="#f2bcd3"/);
  });

  it('load into the editor with the defaults and stay clean', () => {
    const store = createWhiteboardStore({ elements: [minimalCard()] });
    expect(store.getState().elements[0]).toMatchObject({ fillStyle: 'solid', roughness: 0 });
    expect(store.isDirty()).toBe(false);
  });

  it('keep the board bounds finite without width or height', () => {
    const bounds = computeSceneBounds([
      minimalCard({ height: undefined }),
      minimalCard({ id: 'd', width: undefined }),
    ]);
    expect(Number.isFinite(bounds.width)).toBe(true);
    expect(Number.isFinite(bounds.height)).toBe(true);
  });

  it('get their content height when pasted', () => {
    const store = createWhiteboardStore({ elements: [] });
    const short = {
      ...minimalCard({ height: 5 }),
      seed: 1,
      fillStyle: 'solid',
    } as ExcalidrawElement;
    pasteFromClipboard(store, serializeClipboard([short], {}), [100, 100]);
    const [pasted] = store.getState().elements;
    expect(pasted.height).toBe(measureRichTextHeight(CONTENT, 160));
  });
});

describe('text inside nodes a card does not support', () => {
  const code = {
    root: {
      type: 'root',
      children: [
        { type: 'code', children: [{ type: 'code-highlight', text: 'let x = 1' }] },
        { type: 'list', listType: 'bullet', children: [{ type: 'text', text: 'loose item' }] },
      ],
    },
  };

  it('shows in the read-only view', () => {
    const html = render(minimalCard({ content: code }));
    expect(html).toContain('let x = 1');
    expect(html).toContain('loose item');
  });

  it('survives opening the card for editing', () => {
    const text = richTextPlainText(toEditableContent(code).root);
    expect(text).toContain('let x = 1');
    expect(text).toContain('loose item');
  });
});

describe('format bar position', () => {
  it('stays inside the canvas when the card top is scrolled away', () => {
    const card = { ...minimalCard({ x: 40, y: -400, height: 600 }), seed: 1 } as ExcalidrawElement;
    const store = createWhiteboardStore({ elements: [card] });
    mounted = mountEditor(store);
    act(() => store.setState({ canvasSize: { width: 800, height: 600 } }));
    act(() => store.setState({ viewport: { scrollX: 0, scrollY: 0, zoom: 1 } }));
    doubleClick(mounted.canvas, 100, 50);
    const editable = mounted.container.querySelector<HTMLElement>(
      '[data-whiteboard-richtext-editor] [contenteditable="true"]',
    )!;
    const editor = (editable as unknown as { __lexicalEditor: LexicalEditor }).__lexicalEditor;
    act(() => {
      editor.update(() => ($getRoot().getFirstDescendant() as TextNode).select(0, 4), {
        discrete: true,
      });
    });
    const bar = mounted.container.querySelector<HTMLElement>('[data-richtext-format-bar]')!;
    expect(Number.parseFloat(bar.style.top)).toBeGreaterThanOrEqual(44);
    expect(store.getState().elements[0] as RichTextElement).toBeTruthy();
  });
});
