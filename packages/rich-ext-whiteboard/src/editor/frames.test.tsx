// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, doubleClick, drag, key, mountEditor } from '../../tests/harness';
import { newElement, newFrameElement } from '../model/create';
import type { ExcalidrawElement } from '../scene/types';
import { duplicateSelection } from './actions';
import { copySelection, pasteFromClipboard } from './clipboard-actions';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const rect = (id: string, x: number, y: number, frameId: string | null = null) =>
  ({
    ...newElement('rectangle', { x, y, width: 50, height: 50 }),
    id,
    frameId,
    backgroundColor: '#fff',
  }) as ExcalidrawElement;

const frame = () =>
  ({
    ...newFrameElement({ x: 0, y: 40, width: 300, height: 300 }),
    id: 'f',
  }) as ExcalidrawElement;

const find = (store: ReturnType<typeof createWhiteboardStore>, id: string) =>
  store.getState().elements.find((el) => el.id === id)!;

describe('frames in the editor', () => {
  it('adopts the elements a new frame encloses', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 100, 100), rect('b', 500, 100)] });
    store.setState({ tool: 'frame' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [50, 50], [400, 400]);
    const created = store.getState().elements.find((el) => el.type === 'frame')!;
    expect(find(store, 'a').frameId).toBe(created.id);
    expect(find(store, 'b').frameId).toBeNull();
  });

  it('moves children with the frame', () => {
    const store = createWhiteboardStore({ elements: [frame(), rect('a', 100, 100, 'f')] });
    mounted = mountEditor(store);
    drag(mounted.canvas, [20, 30], [120, 30]);
    expect(find(store, 'f').x).toBe(100);
    expect(find(store, 'a').x).toBe(200);
    expect(find(store, 'a').frameId).toBe('f');
  });

  it('clears frameId when a child is dragged out', () => {
    const store = createWhiteboardStore({ elements: [frame(), rect('a', 100, 100, 'f')] });
    mounted = mountEditor(store);
    drag(mounted.canvas, [120, 120], [620, 120]);
    expect(find(store, 'a').frameId).toBeNull();
  });

  it('assigns frameId to an element dragged into a frame', () => {
    const store = createWhiteboardStore({ elements: [frame(), rect('a', 500, 100)] });
    mounted = mountEditor(store);
    drag(mounted.canvas, [520, 120], [120, 120]);
    expect(find(store, 'a').frameId).toBe('f');
  });

  it('puts a shape drawn inside a frame into it', () => {
    const store = createWhiteboardStore({ elements: [frame()] });
    store.setState({ tool: 'rectangle' });
    mounted = mountEditor(store);
    drag(mounted.canvas, [50, 100], [120, 160]);
    const created = store.getState().elements.find((el) => el.type === 'rectangle')!;
    expect(created.frameId).toBe('f');
  });

  it('keeps children when the frame is deleted', () => {
    const store = createWhiteboardStore({ elements: [frame(), rect('a', 100, 100, 'f')] });
    mounted = mountEditor(store);
    click(mounted.canvas, 20, 30);
    key(mounted.canvas, 'Delete');
    expect(find(store, 'f').isDeleted).toBe(true);
    expect(find(store, 'a').isDeleted).toBeFalsy();
    expect(find(store, 'a').frameId).toBeNull();
  });

  it('drops frameId from a child pasted outside its frame', () => {
    const store = createWhiteboardStore({ elements: [frame(), rect('a', 100, 100, 'f')] });
    mounted = mountEditor(store);
    store.setState({ selectedIds: new Set(['a']) });
    const raw = copySelection(store);
    pasteFromClipboard(store, raw, [800, 800]);
    const pasted = store
      .getState()
      .elements.find((el) => el.type === 'rectangle' && el.id !== 'a')!;
    expect(pasted.frameId).toBeNull();
  });

  it('keeps a duplicated child inside its frame', () => {
    const store = createWhiteboardStore({ elements: [frame(), rect('a', 100, 100, 'f')] });
    mounted = mountEditor(store);
    store.setState({ selectedIds: new Set(['a']) });
    duplicateSelection(store);
    const copy = store.getState().elements.find((el) => el.type === 'rectangle' && el.id !== 'a')!;
    expect(copy.frameId).toBe('f');
  });

  it('renames the frame from its title', () => {
    const store = createWhiteboardStore({ elements: [frame()] });
    mounted = mountEditor(store);
    doubleClick(mounted.canvas, 20, 30);
    const input = mounted.container.querySelector<HTMLInputElement>('[data-frame-name-editor]')!;
    expect(input).not.toBeNull();
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
        input,
        'Flow',
      );
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    key(input, 'Enter');
    expect((find(store, 'f') as { name?: string | null }).name).toBe('Flow');
    expect(mounted.container.querySelector('[data-frame-name-editor]')).toBeNull();
    store.undo();
    expect((find(store, 'f') as { name?: string | null }).name).toBeNull();
  });
});
