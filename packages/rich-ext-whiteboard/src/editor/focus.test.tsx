// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, key, mountEditor, pointer } from '../../tests/harness';
import { newElement } from '../model/create';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const textarea = () =>
  mounted!.container.querySelector<HTMLTextAreaElement>('[data-whiteboard-text-editor]');

describe('focus in a real browser event order', () => {
  it('keeps the new text box open after the mousedown focus change', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ tool: 'text' });
    mounted = mountEditor(store);
    const { canvas } = mounted;
    pointer(canvas, 'pointerdown', 100, 100);
    act(() => canvas.focus());
    pointer(canvas, 'pointerup', 100, 100);
    expect(textarea()).not.toBeNull();
    expect(document.activeElement).toBe(textarea());
  });

  it('runs shortcuts after a click on the style panel', () => {
    const el = newElement('rectangle', { x: 0, y: 0, width: 100, height: 100 });
    const store = createWhiteboardStore({ elements: [el] });
    mounted = mountEditor(store);
    click(mounted.canvas, 0, 50);
    const swatch = mounted.container.querySelector<HTMLButtonElement>(
      '[data-swatch="strokeColor:#e03131"]',
    )!;
    act(() => {
      swatch.focus();
      swatch.click();
    });
    key(swatch, 'z', { ctrlKey: true });
    expect(store.getState().elements[0].strokeColor).not.toBe('#e03131');
    key(swatch, 'Delete');
    expect(store.getState().elements[0].isDeleted).toBe(true);
  });

  it('lets Escape leave a drawing tool picked from the toolbar', () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    const button = mounted.container.querySelector<HTMLButtonElement>('[data-tool="rectangle"]')!;
    act(() => {
      button.focus();
      button.click();
    });
    expect(store.getState().tool).toBe('rectangle');
    key(button, 'Escape');
    expect(store.getState().tool).toBe('selection');
  });

  it('leaves typing in the frame name field alone', () => {
    const store = createWhiteboardStore({ elements: [] });
    mounted = mountEditor(store);
    const input = document.createElement('input');
    mounted.container.querySelector('[data-whiteboard-canvas]')!.append(input);
    key(input, 'Delete');
    key(input, 'r');
    expect(store.getState().tool).toBe('selection');
  });
});
