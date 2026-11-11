// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, mountEditor, pointer } from '../../tests/harness';
import { newElement } from '../model/create';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => mounted?.unmount());

function clipboardEvent(type: 'copy' | 'cut' | 'paste', initial = '') {
  const data = new Map<string, string>([['text/plain', initial]]);
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: {
      getData: (k: string) => data.get(k) ?? '',
      setData: (k: string, v: string) => data.set(k, v),
      files: [],
      items: [],
    },
  });
  return { event, data };
}

describe('clipboard events', () => {
  it('copies the selection and pastes it at the pointer', () => {
    const el = newElement('rectangle', {
      x: 0,
      y: 0,
      width: 40,
      height: 40,
      backgroundColor: '#000',
    });
    const store = createWhiteboardStore({ elements: [el] });
    mounted = mountEditor(store);
    click(mounted.canvas, 20, 20);
    const copy = clipboardEvent('copy');
    act(() => {
      mounted!.canvas.dispatchEvent(copy.event);
    });
    expect(copy.event.defaultPrevented).toBe(true);
    expect(JSON.parse(copy.data.get('text/plain')!).type).toBe('excalidraw/clipboard');

    pointer(mounted.canvas, 'pointermove', 300, 200);
    const paste = clipboardEvent('paste', copy.data.get('text/plain'));
    act(() => {
      mounted!.canvas.dispatchEvent(paste.event);
    });
    const pasted = store.getState().elements[1];
    expect(pasted.x + pasted.width / 2).toBeCloseTo(300);
    expect(pasted.y + pasted.height / 2).toBeCloseTo(200);
  });
});
