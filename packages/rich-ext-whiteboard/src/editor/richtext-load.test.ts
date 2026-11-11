import { describe, expect, it } from 'vitest';

import { newRichTextElement } from '../model/create';
import { paragraphs } from '../model/richtext';
import { createWhiteboardStore } from './store';

describe('loading rich text cards', () => {
  it('raises a short card to its content height without history or dirty state', () => {
    const card = newRichTextElement({
      width: 160,
      height: 10,
      content: paragraphs(['a', 'b', 'c']),
    });
    const store = createWhiteboardStore({ elements: [card] });
    expect(store.getState().elements[0].height).toBeGreaterThan(10);
    expect(store.isDirty()).toBe(false);
    expect(store.canUndo()).toBe(false);
  });
});
