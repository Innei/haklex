import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { parseClipboard, serializeClipboard } from '../model/clipboard';
import { newElement, newImageElement, newLinearElement, newTextElement } from '../model/create';
import { setTextMeasurer } from '../model/measure';
import type { LinearElement, TextElement } from '../scene/types';
import { copySelection, cutSelection, pasteFromClipboard } from './clipboard-actions';
import { createWhiteboardStore } from './store';

beforeEach(() => setTextMeasurer((t) => t.length * 10));
afterEach(() => setTextMeasurer(null));

function scene() {
  const box = {
    ...newElement('rectangle', { x: 0, y: 0, width: 100, height: 50 }),
    id: 'box',
    boundElements: [
      { id: 't', type: 'text' },
      { id: 'arr', type: 'arrow' },
    ],
  };
  const text = {
    ...newTextElement({ text: 'hi', containerId: 'box' }),
    id: 't',
    x: 40,
    y: 12,
    width: 20,
    height: 25,
  };
  const target = {
    ...newElement('ellipse', { x: 300, y: 0, width: 50, height: 50 }),
    id: 'target',
    boundElements: [{ id: 'arr', type: 'arrow' }],
  };
  const arrow = {
    ...newLinearElement('arrow', {
      x: 100,
      y: 25,
      width: 200,
      height: 0,
      points: [
        [0, 0],
        [200, 0],
      ],
    }),
    id: 'arr',
    startBinding: { elementId: 'box', focus: 0, gap: 1 },
    endBinding: { elementId: 'target', focus: 0, gap: 1 },
  };
  return [box, text, target, arrow];
}

describe('clipboard format', () => {
  it('round-trips elements and referenced files', () => {
    const img = newImageElement({ fileId: 'f1' });
    const json = serializeClipboard([img], {
      f1: { id: 'f1', dataURL: 'data:,' },
      unused: { id: 'unused', dataURL: 'x' },
    });
    const parsed = JSON.parse(json);
    expect(parsed.type).toBe('excalidraw/clipboard');
    expect(Object.keys(parsed.files)).toEqual(['f1']);
    expect(parseClipboard(json)).toEqual({
      elements: [img],
      files: { f1: { id: 'f1', dataURL: 'data:,' } },
    });
  });

  it('accepts a whole excalidraw scene', () => {
    const el = newElement('rectangle', {});
    expect(parseClipboard(JSON.stringify({ type: 'excalidraw', elements: [el] }))).toMatchObject({
      elements: [el],
    });
  });

  it('treats plain text as text and ignores foreign JSON', () => {
    expect(parseClipboard('hello')).toEqual({ text: 'hello' });
    expect(parseClipboard('{"foo":1}')).toBeNull();
    expect(parseClipboard('   ')).toBeNull();
  });
});

describe('copy and paste', () => {
  it('pastes clones centred on the pointer with links remapped to the new ids', () => {
    const store = createWhiteboardStore({ elements: scene() });
    store.setState({ selectedIds: new Set(['box', 'target', 'arr']) });
    const data = copySelection(store);
    pasteFromClipboard(store, data, [1000, 1000]);
    const els = store.getState().elements;
    expect(els).toHaveLength(8);
    const pasted = els.slice(4);
    const ids = new Set(pasted.map((el) => el.id));
    expect(['box', 't', 'target', 'arr'].some((id) => ids.has(id))).toBe(false);
    const box = pasted.find((el) => el.type === 'rectangle')!;
    const text = pasted.find((el) => el.type === 'text') as TextElement;
    const arrow = pasted.find((el) => el.type === 'arrow') as LinearElement;
    const target = pasted.find((el) => el.type === 'ellipse')!;
    expect(text.containerId).toBe(box.id);
    expect(box.boundElements).toEqual([
      { id: text.id, type: 'text' },
      { id: arrow.id, type: 'arrow' },
    ]);
    expect(arrow.startBinding?.elementId).toBe(box.id);
    expect(arrow.endBinding?.elementId).toBe(target.id);
    const minX = Math.min(...pasted.map((el) => el.x));
    const maxX = Math.max(...pasted.map((el) => el.x + el.width));
    expect((minX + maxX) / 2).toBeCloseTo(1000);
    expect(store.getState().selectedIds).toEqual(new Set([box.id, target.id, arrow.id]));
    store.undo();
    expect(store.getState().elements).toHaveLength(4);
  });

  it('drops bindings to elements that were not copied', () => {
    const store = createWhiteboardStore({ elements: scene() });
    store.setState({ selectedIds: new Set(['arr']) });
    pasteFromClipboard(store, copySelection(store), [0, 0]);
    const arrow = store.getState().elements.at(-1) as LinearElement;
    expect(arrow.startBinding).toBeNull();
    expect(arrow.endBinding).toBeNull();
  });

  it('pastes plain text as a text element', () => {
    const store = createWhiteboardStore({ elements: [] });
    pasteFromClipboard(store, 'note', [50, 50]);
    const [t] = store.getState().elements as TextElement[];
    expect(t).toMatchObject({ type: 'text', text: 'note', width: 40 });
  });

  it('cuts by copying and deleting', () => {
    const store = createWhiteboardStore({ elements: scene() });
    store.setState({ selectedIds: new Set(['target']) });
    const data = cutSelection(store);
    expect(parseClipboard(data)).toMatchObject({ elements: [{ id: 'target' }] });
    expect(store.getState().elements.find((el) => el.id === 'target')!.isDeleted).toBe(true);
  });
});
