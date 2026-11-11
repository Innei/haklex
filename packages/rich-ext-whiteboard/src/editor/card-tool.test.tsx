// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { drag, key, mountEditor, pointer } from '../../tests/harness';
import { newRichTextElement } from '../model/create';
import { paragraphs } from '../model/richtext';
import { measureRichTextHeight } from '../model/richtext-layout';
import { createWhiteboardStore } from './store';
import { resizeElements } from './transform';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const setup = () => {
  const store = createWhiteboardStore({ elements: [] });
  mounted = mountEditor(store);
  return store;
};

describe('card tool', () => {
  it('is picked with N', () => {
    const store = setup();
    key(mounted!.canvas, 'n');
    expect(store.getState().tool).toBe('card');
  });

  it('places a 200x120 card on click and starts editing it', () => {
    const store = setup();
    act(() => store.setState({ tool: 'card' }));
    pointer(mounted!.canvas, 'pointerdown', 300, 200);
    pointer(mounted!.canvas, 'pointerup', 300, 200);
    const [el] = store.getState().elements;
    expect(el).toMatchObject({ type: 'richtext', x: 200, y: 140, width: 200, height: 120 });
    expect(store.getState().editingRichTextId).toBe(el.id);
    expect(store.getState().tool).toBe('selection');
  });

  it('sizes the card by dragging', () => {
    const store = setup();
    act(() => store.setState({ tool: 'card' }));
    drag(mounted!.canvas, [100, 100], [400, 300]);
    const [el] = store.getState().elements;
    expect(el).toMatchObject({ type: 'richtext', x: 100, y: 100, width: 300, height: 200 });
  });

  it('shows card styles but no font rows', () => {
    const el = newRichTextElement({ x: 0, y: 0, width: 160, height: 100 });
    const store = createWhiteboardStore({ elements: [el] });
    mounted = mountEditor(store);
    act(() => store.setState({ selectedIds: new Set([el.id]) }));
    const { container } = mounted;
    expect(container.querySelector('[data-swatch^="backgroundColor"]')).not.toBeNull();
    expect(container.querySelector('[data-swatch^="strokeColor"]')).not.toBeNull();
    expect(container.querySelector('[data-style-row="shadow"]')).not.toBeNull();
    expect(container.textContent).toContain('Edges');
    expect(container.textContent).not.toContain('Font size');
  });
});

describe('resizing a card', () => {
  it('never goes below the content height', () => {
    const content = paragraphs(['a', 'b', 'c', 'd']);
    const el = newRichTextElement({ x: 0, y: 0, width: 160, height: 200, content });
    const [resized] = resizeElements([el], 's', [80, 200], [80, 10], {});
    expect(resized.height).toBe(measureRichTextHeight(content, resized.width));
  });
});
