// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';

import { newTextElement } from '../model/create';
import type { TextElement } from '../scene/types';
import { createWhiteboardStore } from './store';
import { finishTextEditing, startTextEditing, updateEditingText } from './text-actions';

const note = () => ({
  ...newTextElement({ text: 'draft', fontFamily: 2 }),
  id: 't',
  index: 'a1',
  version: 5,
});

const textOf = (store: ReturnType<typeof createWhiteboardStore>) =>
  store.getState().elements.find((el) => el.id === 't') as TextElement;

describe('remote changes to a text being edited', () => {
  it('keeps what the user typed over a remote change that arrived meanwhile', () => {
    const store = createWhiteboardStore({ elements: [note()] }, { sync: true });
    startTextEditing(store, { elementId: 't' });
    updateEditingText(store, 'mine');
    store.applyRemote({ elements: [{ ...note(), text: 'theirs', version: 20 }] });
    expect(textOf(store).text).toBe('mine');
    finishTextEditing(store);
    expect(textOf(store).text).toBe('mine');
    expect(textOf(store).version).toBeGreaterThan(20);
  });

  it('takes the remote change when the user typed nothing', () => {
    const store = createWhiteboardStore({ elements: [note()] }, { sync: true });
    startTextEditing(store, { elementId: 't' });
    store.applyRemote({
      elements: [{ ...note(), text: 'theirs', originalText: 'theirs', version: 20 }],
    });
    finishTextEditing(store);
    expect(textOf(store).text).toBe('theirs');
  });
});
