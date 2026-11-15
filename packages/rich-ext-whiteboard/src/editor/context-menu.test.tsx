// @vitest-environment happy-dom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { key, pointer } from '../../tests/harness';
import { newElement } from '../model/create';
import type { ContextMenuContext } from './context-menu';
import { createWhiteboardStore } from './store';
import type { WhiteboardEditorProps } from './WhiteboardEditor';
import { WhiteboardEditor } from './WhiteboardEditor';

let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

function mount(props: Omit<WhiteboardEditorProps, 'theme'>) {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div');
  document.body.append(container);
  let root: Root;
  act(() => {
    root = createRoot(container);
    root.render(<WhiteboardEditor theme="light" {...props} />);
  });
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return { container, canvas: container.querySelector<HTMLElement>('[data-whiteboard-canvas]')! };
}

const rect = (id: string, x: number, y: number) => ({
  ...newElement('rectangle', { x, y, width: 100, height: 50, backgroundColor: '#ffc9c9' }),
  id,
});

function rightClick(target: Element, x: number, y: number): MouseEvent {
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    button: 2,
    clientX: x,
    clientY: y,
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

const menuOf = (container: HTMLElement) => container.querySelector<HTMLElement>('[role="menu"]');
const labelsOf = (container: HTMLElement) =>
  [...container.querySelectorAll('[role="menuitem"]')].map((item) => item.textContent);

async function choose(container: HTMLElement, label: string) {
  const item = [...container.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
    (node) => node.textContent === label,
  );
  if (!item) throw new Error(`no menu item ${label}`);
  await act(async () => {
    item.click();
    await Promise.resolve();
  });
}

const liveIds = (store: ReturnType<typeof createWhiteboardStore>) =>
  store
    .getState()
    .elements.filter((el) => !el.isDeleted)
    .map((el) => el.id);

describe('context menu', () => {
  it('selects the element under the pointer and lists element actions', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0), rect('b', 300, 0)] });
    const { canvas, container } = mount({ store });
    const event = rightClick(canvas, 350, 25);
    expect(event.defaultPrevented).toBe(true);
    expect([...store.getState().selectedIds]).toEqual(['b']);
    expect(labelsOf(container)).toEqual([
      'Copy',
      'Cut',
      'Duplicate',
      'Bring forward',
      'Send backward',
      'Bring to front',
      'Send to back',
      'Delete',
    ]);
  });

  it('keeps a multi-selection when one of its elements is right-clicked and offers grouping', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0), rect('b', 300, 0)] });
    store.setState({ selectedIds: new Set(['a', 'b']) });
    const { canvas, container } = mount({ store });
    rightClick(canvas, 50, 25);
    expect([...store.getState().selectedIds].sort()).toEqual(['a', 'b']);
    expect(labelsOf(container)).toContain('Group');
    expect(labelsOf(container)).not.toContain('Ungroup');
  });

  it('reorders through Bring to front', async () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0), rect('b', 300, 0)] });
    const { canvas, container } = mount({ store });
    rightClick(canvas, 50, 25);
    await choose(container, 'Bring to front');
    expect(liveIds(store)).toEqual(['b', 'a']);
    expect(menuOf(container)).toBeNull();
  });

  it('offers paste and select all on a blank spot and drops the selection', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0)] });
    store.setState({ selectedIds: new Set(['a']) });
    const { canvas, container } = mount({ store });
    rightClick(canvas, 600, 400);
    expect(store.getState().selectedIds.size).toBe(0);
    expect(labelsOf(container)).toEqual(['Paste', 'Select all']);
  });

  it('pastes a copied element at the right-clicked point', async () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0)] });
    const { canvas, container } = mount({ store });
    rightClick(canvas, 50, 25);
    await choose(container, 'Copy');
    rightClick(canvas, 600, 400);
    await choose(container, 'Paste');
    const pasted = store.getState().elements.find((el) => el.id !== 'a')!;
    expect(pasted.type).toBe('rectangle');
    expect(pasted.x + pasted.width / 2).toBe(600);
    expect(pasted.y + pasted.height / 2).toBe(400);
  });

  it('appends host items and tells the host what is selected and where', async () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0)] });
    const onSelect = vi.fn();
    const contexts: ContextMenuContext[] = [];
    const { canvas, container } = mount({
      store,
      contextMenuItems: (ctx) => {
        contexts.push(ctx);
        return [{ key: 'comment', label: 'Comment', onSelect }];
      },
    });
    rightClick(canvas, 50, 25);
    expect(contexts[0].selected.map((el) => el.id)).toEqual(['a']);
    expect(contexts[0].scenePoint).toEqual([50, 25]);
    expect(labelsOf(container).at(-1)).toBe('Comment');
    await choose(container, 'Comment');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(menuOf(container)).toBeNull();
  });

  it('closes on Escape and on a press outside', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0)] });
    const { canvas, container } = mount({ store });
    rightClick(canvas, 50, 25);
    key(menuOf(container)!, 'Escape');
    expect(menuOf(container)).toBeNull();
    expect([...store.getState().selectedIds]).toEqual(['a']);
    rightClick(canvas, 50, 25);
    pointer(canvas, 'pointerdown', 600, 400);
    expect(menuOf(container)).toBeNull();
  });

  it('hands the items to a host that draws its own menu', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0)] });
    const onContextMenu = vi.fn();
    const { canvas, container } = mount({
      store,
      onContextMenu,
      contextMenuItems: () => [{ key: 'host', label: 'Host', onSelect: () => {} }],
    });
    const event = rightClick(canvas, 50, 25);
    expect(event.defaultPrevented).toBe(true);
    expect(menuOf(container)).toBeNull();
    expect(onContextMenu).toHaveBeenCalledTimes(1);
    const request = onContextMenu.mock.calls[0][0];
    expect(request.scenePoint).toEqual([50, 25]);
    expect(
      request.items.map((item: { key?: string; type?: string }) => item.key ?? item.type),
    ).toEqual([
      'copy',
      'cut',
      'duplicate',
      'separator',
      'bring-forward',
      'send-backward',
      'bring-to-front',
      'send-to-back',
      'separator',
      'delete',
      'separator',
      'host',
    ]);
    act(() => request.items.find((item: { key?: string }) => item.key === 'delete').onSelect());
    expect(liveIds(store)).toEqual([]);
  });

  it('stays out of the way when the host switches it off', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0)] });
    const { canvas, container } = mount({ store, chrome: { contextMenu: false } });
    const event = rightClick(canvas, 50, 25);
    expect(event.defaultPrevented).toBe(false);
    expect(menuOf(container)).toBeNull();
  });
});
