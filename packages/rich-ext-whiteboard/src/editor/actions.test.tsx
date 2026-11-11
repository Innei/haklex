// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, key, mountEditor, pointer } from '../../tests/harness';
import { newElement, newLinearElement, newTextElement } from '../model/create';
import { isValidIndex } from '../model/fractional-index';
import {
  bringToFront,
  deleteSelection,
  duplicateSelection,
  groupSelection,
  sendBackward,
  ungroupSelection,
} from './actions';
import { createWhiteboardStore } from './store';
import { applyStyle, getApplicableProps, getCommonValue } from './style-props';

let mounted: Mounted | undefined;
afterEach(() => mounted?.unmount());

const rect = (id: string, extra: Record<string, unknown> = {}) => ({
  ...newElement('rectangle', { x: 0, y: 0, width: 50, height: 50, backgroundColor: '#ffc9c9' }),
  id,
  ...extra,
});

function storeWith(elements: unknown[], selected: string[] = []) {
  const store = createWhiteboardStore({ elements });
  store.commit(({ elements: els }) => ({ elements: [...els] }));
  store.setState({ selectedIds: new Set(selected) });
  return store;
}

describe('style properties', () => {
  it('offers only text properties for text', () => {
    const props = getApplicableProps([newTextElement({ text: 'a' })]);
    expect(props.has('fontSize')).toBe(true);
    expect(props.has('stroke')).toBe(true);
    expect(props.has('fillStyle')).toBe(false);
    expect(props.has('roughness')).toBe(false);
  });

  it('offers arrowheads only for arrows', () => {
    expect(getApplicableProps([newLinearElement('arrow', {})]).has('arrowheads')).toBe(true);
    expect(getApplicableProps([rect('a')]).has('arrowheads')).toBe(false);
  });

  it('reports mixed values', () => {
    const els = [rect('a', { strokeColor: '#000' }), rect('b', { strokeColor: '#e03131' })];
    expect(getCommonValue(els, 'strokeColor')).toBe('mixed');
    expect(getCommonValue([els[0]], 'strokeColor')).toBe('#000');
  });

  it('applies a style to the selection and remembers it for new shapes', () => {
    const store = storeWith([rect('a'), rect('b')], ['a']);
    applyStyle(store, { strokeColor: '#1971c2', roundness: 'sharp' });
    const [a, b] = store.getState().elements;
    expect(a.strokeColor).toBe('#1971c2');
    expect(a.roundness).toBeNull();
    expect(b.strokeColor).not.toBe('#1971c2');
    expect(store.getState().currentStyle.strokeColor).toBe('#1971c2');
  });

  it('switches an arrow to elbow', () => {
    const arrow = newLinearElement('arrow', {
      points: [
        [0, 0],
        [10, 10],
      ],
    });
    const store = storeWith([arrow], [arrow.id]);
    applyStyle(store, { arrowType: 'elbow' });
    expect(store.getState().elements[0]).toMatchObject({ elbowed: true, roundness: null });
  });
});

describe('selection actions', () => {
  it('reorders layers and keeps indices valid and ordered', () => {
    const store = storeWith([rect('a'), rect('b'), rect('c')], ['a']);
    bringToFront(store);
    expect(store.getState().elements.map((el) => el.id)).toEqual(['b', 'c', 'a']);
    store.setState({ selectedIds: new Set(['c']) });
    sendBackward(store);
    expect(store.getState().elements.map((el) => el.id)).toEqual(['c', 'b', 'a']);
    const indices = store.getState().elements.map((el) => el.index);
    expect(indices.every((i) => isValidIndex(i))).toBe(true);
    expect([...indices].sort()).toEqual(indices);
  });

  it('groups and ungroups the outermost level', () => {
    const store = storeWith([rect('a', { groupIds: ['inner'] }), rect('b')], ['a', 'b']);
    groupSelection(store);
    const [a, b] = store.getState().elements;
    expect(a.groupIds).toHaveLength(2);
    expect(a.groupIds![0]).toBe('inner');
    expect(b.groupIds).toEqual([a.groupIds![1]]);
    ungroupSelection(store);
    expect(store.getState().elements[0].groupIds).toEqual(['inner']);
    expect(store.getState().elements[1].groupIds).toEqual([]);
  });

  it('duplicates with new ids, an offset, and remapped bound text', () => {
    const box = rect('box', { boundElements: [{ id: 't', type: 'text' }] });
    const text = { ...newTextElement({ text: 'x', containerId: 'box' }), id: 't' };
    const store = storeWith([box, text], ['box']);
    duplicateSelection(store);
    const els = store.getState().elements;
    expect(els).toHaveLength(4);
    const copy = els[2];
    const copyText = els[3];
    expect(copy.id).not.toBe('box');
    expect(copy.x).toBe(10);
    expect(copyText.type === 'text' && copyText.containerId).toBe(copy.id);
    expect(copy.boundElements).toEqual([{ id: copyText.id, type: 'text' }]);
    expect([...store.getState().selectedIds]).toEqual([copy.id]);
  });

  it('deletes the selection with its text and unbinds arrows', () => {
    const box = rect('box', {
      boundElements: [
        { id: 't', type: 'text' },
        { id: 'arr', type: 'arrow' },
      ],
    });
    const text = { ...newTextElement({ text: 'x', containerId: 'box' }), id: 't' };
    const arrow = {
      ...newLinearElement('arrow', {
        points: [
          [0, 0],
          [10, 0],
        ],
      }),
      id: 'arr',
      endBinding: { elementId: 'box', focus: 0, gap: 4 },
    };
    const store = storeWith([box, text, arrow], ['box']);
    deleteSelection(store);
    const byId = Object.fromEntries(store.getState().elements.map((el) => [el.id, el]));
    expect(byId.box.isDeleted).toBe(true);
    expect(byId.t.isDeleted).toBe(true);
    expect(byId.arr.isDeleted).toBe(false);
    expect((byId.arr as typeof arrow).endBinding).toBeNull();
    expect(store.getState().selectedIds.size).toBe(0);
  });
});

describe('keyboard shortcuts and chrome', () => {
  it('switches tools with letter keys', () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    key(mounted.canvas, 'r');
    expect(store.getState().tool).toBe('rectangle');
    key(mounted.canvas, 'p');
    expect(store.getState().tool).toBe('freedraw');
  });

  it('groups with ctrl+g and undoes with ctrl+z', () => {
    const store = createWhiteboardStore({ elements: [rect('a'), rect('b', { x: 100 })] });
    mounted = mountEditor(store);
    key(mounted.canvas, 'a', { ctrlKey: true });
    key(mounted.canvas, 'g', { ctrlKey: true });
    expect(store.getState().elements[0].groupIds).toHaveLength(1);
    key(mounted.canvas, 'z', { ctrlKey: true });
    expect(store.getState().elements[0].groupIds ?? []).toHaveLength(0);
  });

  it('deletes with the Delete key', () => {
    const store = createWhiteboardStore({ elements: [rect('a')] });
    mounted = mountEditor(store);
    click(mounted.canvas, 25, 25);
    key(mounted.canvas, 'Delete');
    expect(store.getState().elements[0].isDeleted).toBe(true);
  });

  it('shows the style panel for a selection and applies a swatch', () => {
    const store = createWhiteboardStore({ elements: [rect('a')] });
    mounted = mountEditor(store);
    expect(mounted.container.querySelector('[data-style-panel]')).toBeNull();
    click(mounted.canvas, 25, 25);
    const swatch = mounted.container.querySelector<HTMLButtonElement>(
      '[data-style-panel] [data-swatch="strokeColor:#e03131"]',
    );
    expect(swatch).not.toBeNull();
    pointer(swatch!, 'pointerdown', 900, 20);
    pointer(swatch!, 'pointerup', 900, 20);
    expect(store.getState().selectedIds.size).toBe(1);
    act(() => swatch!.click());
    expect(store.getState().elements[0].strokeColor).toBe('#e03131');
  });

  it('selects a tool from the toolbar', () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    const button = mounted.container.querySelector<HTMLButtonElement>('[data-tool="ellipse"]');
    act(() => button!.click());
    expect(store.getState().tool).toBe('ellipse');
    expect(button!.getAttribute('aria-pressed')).toBe('true');
  });
});
