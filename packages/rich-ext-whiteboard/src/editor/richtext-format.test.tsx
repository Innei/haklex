// @vitest-environment happy-dom
import type { LexicalEditor, TextNode } from 'lexical';
import { $getRoot } from 'lexical';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { doubleClick, key, mountEditor } from '../../tests/harness';
import { newRichTextElement } from '../model/create';
import type { RichNode } from '../model/richtext';
import { paragraphs } from '../model/richtext';
import type { RichTextElement } from '../scene/types';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const editable = () =>
  mounted!.container.querySelector<HTMLElement>(
    '[data-whiteboard-richtext-editor] [contenteditable="true"]',
  )!;
const lexical = () => (editable() as unknown as { __lexicalEditor: LexicalEditor }).__lexicalEditor;
const bar = () => mounted!.container.querySelector<HTMLElement>('[data-richtext-format-bar]');
const press = (selector: string) => {
  const button = bar()!.querySelector<HTMLElement>(selector)!;
  act(() => button.click());
};

function openAndSelect() {
  const el = newRichTextElement({
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    content: paragraphs(['Brew', 'Mila']),
  });
  const store = createWhiteboardStore({ elements: [el] });
  mounted = mountEditor(store);
  doubleClick(mounted.canvas, 60, 40);
  act(() => {
    lexical().update(
      () => {
        ($getRoot().getFirstDescendant() as TextNode).select(0, 4);
      },
      { discrete: true },
    );
  });
  return store;
}

const firstBlock = (store: ReturnType<typeof createWhiteboardStore>): RichNode =>
  (store.getState().elements[0] as RichTextElement).content.root.children![0];

describe('card format bar', () => {
  it('appears for a text selection inside the card', () => {
    openAndSelect();
    expect(bar()).not.toBeNull();
  });

  it('makes the selection bold', () => {
    const store = openAndSelect();
    press('[aria-label="Bold"]');
    key(editable(), 'Escape');
    const text = firstBlock(store).children![0];
    expect(Number(text.format) & 1).toBe(1);
  });

  it('colours the selection', () => {
    const store = openAndSelect();
    press('[data-richtext-color="#e03131"]');
    key(editable(), 'Escape');
    expect(firstBlock(store).children![0].style).toContain('color: #e03131');
  });

  it('turns the block into a bulleted list', () => {
    const store = openAndSelect();
    press('[aria-label="Bulleted list"]');
    key(editable(), 'Escape');
    expect(firstBlock(store).type).toBe('list');
  });

  it('turns the block into a heading and back', () => {
    const store = openAndSelect();
    press('[aria-label="Heading"]');
    expect(
      lexical()
        .getEditorState()
        .read(() => $getRoot().getFirstChild()!.getType()),
    ).toBe('heading');
    press('[aria-label="Heading"]');
    key(editable(), 'Escape');
    expect(firstBlock(store).type).toBe('paragraph');
  });
});
