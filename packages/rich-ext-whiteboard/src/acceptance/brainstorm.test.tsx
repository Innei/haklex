// @vitest-environment happy-dom
import type { LexicalEditor } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { doubleClick, key, mountEditor } from '../../tests/harness';
import { createWhiteboardStore } from '../editor/store';
import { richTextPlainText } from '../model/richtext';
import { computeSceneBounds, Scene } from '../scene/Scene';
import type { ExcalidrawElement, RichTextElement, SvgElement } from '../scene/types';
import { BRAINSTORM_BOARD } from './brainstorm-board';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const load = () =>
  createWhiteboardStore(structuredClone(BRAINSTORM_BOARD) as unknown as Record<string, unknown>);
const byId = (elements: readonly ExcalidrawElement[], id: string) =>
  elements.find((el) => el.id === id)!;

describe('brainstorm acceptance board', () => {
  it('keeps every field through load and getScene, only raising card heights', () => {
    const scene = load().getScene();
    expect(scene.elements).toHaveLength(BRAINSTORM_BOARD.elements.length);
    for (const original of BRAINSTORM_BOARD.elements) {
      const { height, ...rest } = byId(scene.elements, original.id);
      const { height: before, ...expected } = original;
      expect(rest).toEqual(expected);
      expect(height).toBeGreaterThanOrEqual(before);
    }
  });

  it('draws the same bounds in the article as in the editor', () => {
    const store = load();
    expect(computeSceneBounds(store.getState().elements as ExcalidrawElement[])).toEqual(
      computeSceneBounds(BRAINSTORM_BOARD.elements),
    );
  });

  it('renders cards, the sticker and shadows in the read-only view', () => {
    const html = renderToStaticMarkup(<Scene scene={BRAINSTORM_BOARD} />);
    expect(html.match(/<foreignObject/g)).toHaveLength(6);
    expect(html).toMatch(/<image[^>]*href="data:image\/svg\+xml/);
    expect(html).toContain('feDropShadow');
    expect(html).toContain('Taste test');
  });

  it('lets a person edit one card without touching the rest', () => {
    const store = load();
    mounted = mountEditor(store);
    const before = store.getState().elements;
    const brew = byId(before, 'card-brew');
    doubleClick(mounted.canvas, brew.x + 20, brew.y + 20);
    const editable = mounted.container.querySelector<HTMLElement>(
      '[data-whiteboard-richtext-editor] [contenteditable="true"]',
    )!;
    const editor = (editable as unknown as { __lexicalEditor: LexicalEditor }).__lexicalEditor;
    act(() => {
      editor.update(
        () => {
          $getRoot().append($createParagraphNode().append($createTextNode('+ Dan')));
        },
        { discrete: true },
      );
    });
    key(editable, 'Escape');
    const after = store.getState().elements;
    const edited = byId(after, 'card-brew') as RichTextElement;
    expect(richTextPlainText(edited.content.root)).toContain('+ Dan');
    const withoutIndex = ({ index: _index, ...rest }: ExcalidrawElement) => rest;
    for (const el of after) {
      if (el.id !== 'card-brew')
        expect(withoutIndex(el)).toEqual(withoutIndex(byId(before, el.id)));
    }
  });

  it('lets a person move the sticker', () => {
    const store = load();
    mounted = mountEditor(store);
    act(() => store.setState({ selectedIds: new Set(['bottle']) }));
    key(mounted.canvas, 'ArrowRight', { shiftKey: true });
    const bottle = byId(store.getState().elements, 'bottle') as SvgElement;
    const original = byId(BRAINSTORM_BOARD.elements, 'bottle') as SvgElement;
    expect(bottle.x).toBe(original.x + 10);
    expect(bottle.svg).toBe(original.svg);
  });
});
