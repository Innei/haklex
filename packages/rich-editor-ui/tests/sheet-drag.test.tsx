// @vitest-environment happy-dom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { SheetStackEntry } from '../src/components/dialog/sheet';
import { getSnapshot, presentDialog, removeDialog } from '../src/components/dialog/store';
import * as css from '../src/components/dialog/styles.css';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  container?.remove();
  root = null;
  container = null;
  for (const item of getSnapshot()) removeDialog(item.id);
});

const ScrollingContent = () => (
  <div data-testid="scroller" style={{ overflowY: 'auto', height: 100 }}>
    <div style={{ height: 1000 }}>long content</div>
  </div>
);

function renderSheet() {
  const confirmDismiss = vi.fn(() => false);
  presentDialog({ content: ScrollingContent, sheet: true, confirmDismiss });
  const item = getSnapshot().at(-1)!;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root!.render(<SheetStackEntry index={0} item={item} />));
  const scroller = document.querySelector<HTMLElement>('[data-testid="scroller"]')!;
  Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: 1000 });
  Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 100 });
  scroller.scrollTop = 300;
  return { confirmDismiss, scroller };
}

function touch(target: Element, type: string, clientY: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  const point = { clientY, clientX: 0, target };
  Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : [point] });
  Object.defineProperty(event, 'changedTouches', { value: [point] });
  act(() => {
    target.dispatchEvent(event);
  });
}

function swipeDown(target: Element) {
  touch(target, 'touchstart', 100);
  touch(target, 'touchmove', 200);
  touch(target, 'touchmove', 500);
  touch(target, 'touchend', 500);
}

describe('SheetStackEntry drag', () => {
  it('lets a scrolled inner element keep a downward swipe', async () => {
    const { confirmDismiss, scroller } = renderSheet();
    swipeDown(scroller.firstElementChild!);
    await act(async () => {});
    expect(confirmDismiss).not.toHaveBeenCalled();
  });

  it('starts a drag from the inner element once it is scrolled to top', async () => {
    const { confirmDismiss, scroller } = renderSheet();
    scroller.scrollTop = 0;
    swipeDown(scroller.firstElementChild!);
    await act(async () => {});
    expect(confirmDismiss).toHaveBeenCalledTimes(1);
  });

  it('always starts a drag from the handle', async () => {
    const { confirmDismiss } = renderSheet();
    const handle = document.querySelector(`.${css.sheetDragHandle}`)!;
    swipeDown(handle);
    await act(async () => {});
    expect(confirmDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not start a drag inside a scrolled contenteditable', async () => {
    const { confirmDismiss, scroller } = renderSheet();
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    scroller.firstElementChild!.append(editable);
    swipeDown(editable);
    await act(async () => {});
    expect(confirmDismiss).not.toHaveBeenCalled();
  });
});
