// @vitest-environment happy-dom
import type { LexicalEditor } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { doubleClick, key, mountEditor } from '../../tests/harness';
import { newRichTextElement } from '../model/create';
import { paragraphs, richTextPlainText } from '../model/richtext';
import type { RichTextElement } from '../scene/types';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const card = () =>
  newRichTextElement({
    x: 0,
    y: 0,
    width: 160,
    height: 100,
    content: paragraphs(['Brew', 'Mila']),
  });

const editable = () =>
  mounted!.container.querySelector<HTMLElement>(
    '[data-whiteboard-richtext-editor] [contenteditable="true"]',
  );

const lexical = (): LexicalEditor =>
  (editable() as unknown as { __lexicalEditor: LexicalEditor }).__lexicalEditor;

const append = (text: string) =>
  act(() => {
    lexical().update(
      () => {
        $getRoot().append($createParagraphNode().append($createTextNode(text)));
      },
      { discrete: true },
    );
  });

const cardIn = (store: ReturnType<typeof createWhiteboardStore>) =>
  store.getState().elements[0] as RichTextElement;

function open() {
  const el = card();
  const store = createWhiteboardStore({ elements: [el] });
  mounted = mountEditor(store);
  doubleClick(mounted.canvas, 60, 40);
  return { el, store };
}

describe('editing a rich text card', () => {
  it('opens an in-place editor with the card text on double-click', () => {
    const { el, store } = open();
    expect(store.getState().editingRichTextId).toBe(el.id);
    expect(editable()?.textContent).toContain('Brew');
  });

  it('commits typed content on Escape as one history entry', () => {
    const { store } = open();
    append('more');
    key(editable()!, 'Escape');
    expect(store.getState().editingRichTextId).toBeNull();
    expect(richTextPlainText(cardIn(store).content.root)).toContain('more');
    act(() => store.undo());
    expect(richTextPlainText(cardIn(store).content.root)).not.toContain('more');
  });

  it('leaves no history and no dirty state when nothing changed', () => {
    const { store } = open();
    key(editable()!, 'Escape');
    expect(store.getState().editingRichTextId).toBeNull();
    expect(store.canUndo()).toBe(false);
    expect(store.isDirty()).toBe(false);
  });

  it('grows the card when the content gets taller', () => {
    const { store } = open();
    for (let i = 0; i < 8; i++) append(`line ${i}`);
    key(editable()!, 'Escape');
    expect(cardIn(store).height).toBeGreaterThan(100);
  });

  it('keeps whiteboard shortcuts away from the card while typing', () => {
    const { store } = open();
    key(editable()!, 'r');
    key(editable()!, 'Delete');
    expect(store.getState().tool).toBe('selection');
    expect(cardIn(store).isDeleted).toBeFalsy();
  });

  it('opens the editor with Enter on a selected card', () => {
    const el = card();
    const store = createWhiteboardStore({ elements: [el] });
    mounted = mountEditor(store);
    act(() => store.setState({ selectedIds: new Set([el.id]) }));
    key(mounted.canvas, 'Enter');
    expect(store.getState().editingRichTextId).toBe(el.id);
  });

  it('turns unsupported nodes into text when editing starts', () => {
    const el = newRichTextElement({
      x: 0,
      y: 0,
      width: 160,
      height: 100,
      content: {
        root: {
          type: 'root',
          children: [{ type: 'image', children: [{ type: 'text', text: 'caption' }] }],
        },
      },
    });
    const store = createWhiteboardStore({ elements: [el] });
    mounted = mountEditor(store);
    doubleClick(mounted.canvas, 60, 40);
    expect(editable()?.textContent).toContain('caption');
  });
});
