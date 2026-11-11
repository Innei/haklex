// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, doubleClick, drag, key, mountEditor } from '../../tests/harness';
import { newElement, newLinearElement } from '../model/create';
import { setTextMeasurer } from '../model/measure';
import type { TextElement } from '../scene/types';
import { createWhiteboardStore } from './store';
import { getTransformHandles } from './transform';

let mounted: Mounted | undefined;
beforeEach(() => setTextMeasurer((text) => text.length * 10));
afterEach(() => {
  mounted?.unmount();
  setTextMeasurer(null);
});

function editor() {
  return mounted!.container.querySelector<HTMLTextAreaElement>('[data-whiteboard-text-editor]');
}

function type(value: string) {
  const el = editor()!;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

const texts = (store: ReturnType<typeof createWhiteboardStore>) =>
  store.getState().elements.filter((el) => el.type === 'text' && !el.isDeleted) as TextElement[];

describe('text tool', () => {
  it('creates measured text where clicked and commits it as one entry', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ tool: 'text' });
    mounted = mountEditor(store);
    click(mounted.canvas, 100, 100);
    expect(editor()).not.toBeNull();
    type('hello');
    key(editor()!, 'Escape');
    expect(editor()).toBeNull();
    const [t] = texts(store);
    expect(t).toMatchObject({
      text: 'hello',
      originalText: 'hello',
      width: 50,
      height: 25,
      x: 100,
    });
    expect(store.getState().tool).toBe('selection');
    store.undo();
    expect(texts(store)).toHaveLength(0);
  });

  it('drops empty text without a history entry', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ tool: 'text' });
    mounted = mountEditor(store);
    click(mounted.canvas, 100, 100);
    key(editor()!, 'Escape');
    expect(store.getState().elements).toHaveLength(0);
    expect(store.canUndo()).toBe(false);
  });

  it('edits existing text on double click', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ tool: 'text' });
    mounted = mountEditor(store);
    click(mounted.canvas, 100, 100);
    type('abc');
    key(editor()!, 'Escape');
    doubleClick(mounted.canvas, 110, 110);
    expect(editor()!.value).toBe('abc');
    type('abcdef');
    key(editor()!, 'Escape');
    expect(texts(store)[0].width).toBe(60);
  });
});

describe('container text', () => {
  it('binds new text to a shape on double click and centres it', () => {
    const box = newElement('rectangle', { x: 0, y: 0, width: 200, height: 100 });
    const store = createWhiteboardStore({ elements: [box] });
    mounted = mountEditor(store);
    doubleClick(mounted.canvas, 100, 2);
    type('hi');
    key(editor()!, 'Escape');
    const [t] = texts(store);
    const container = store.getState().elements.find((el) => el.id === box.id)!;
    expect(t.containerId).toBe(box.id);
    expect(container.boundElements).toEqual([{ id: t.id, type: 'text' }]);
    expect(t.x + t.width / 2).toBe(100);
    expect(t.y + t.height / 2).toBe(50);
    expect(t.textAlign).toBe('center');
  });

  it('adds a label at the middle of an arrow', () => {
    const arrow = newLinearElement('arrow', {
      x: 0,
      y: 100,
      width: 300,
      height: 0,
      points: [
        [0, 0],
        [300, 0],
      ],
    });
    const store = createWhiteboardStore({ elements: [arrow] });
    mounted = mountEditor(store);
    doubleClick(mounted.canvas, 150, 100);
    type('go');
    key(editor()!, 'Escape');
    const [t] = texts(store);
    expect(t.containerId).toBe(arrow.id);
    expect(t.x + t.width / 2).toBe(150);
    expect(t.y + t.height / 2).toBe(100);
  });

  it('re-wraps bound text when the container is resized', () => {
    const box = newElement('rectangle', {
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      backgroundColor: '#fff',
    });
    const store = createWhiteboardStore({ elements: [box] });
    mounted = mountEditor(store);
    doubleClick(mounted.canvas, 100, 50);
    type('aaa bbb');
    key(editor()!, 'Escape');
    click(mounted.canvas, 10, 10);
    const { e } = getTransformHandles([0, 0, 200, 100], 1);
    drag(mounted.canvas, e, [e[0] - 130, e[1]]);
    const [t] = texts(store);
    expect(t.text).toBe('aaa\nbbb');
    expect(t.x + t.width / 2).toBeCloseTo(35);
  });
});
