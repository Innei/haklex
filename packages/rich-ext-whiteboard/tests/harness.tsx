import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { WhiteboardStore } from '../src/editor/store';
import { WhiteboardEditor } from '../src/editor/WhiteboardEditor';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

export interface Mounted {
  canvas: HTMLElement;
  container: HTMLElement;
  unmount: () => void;
}

export function mountEditor(
  store: WhiteboardStore,
  { theme = 'light' }: { theme?: 'light' | 'dark' } = {},
): Mounted {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div');
  document.body.append(container);
  let root: Root;
  act(() => {
    root = createRoot(container);
    root.render(<WhiteboardEditor store={store} theme={theme} />);
  });
  const canvas = container.querySelector<HTMLElement>('[data-whiteboard-canvas]')!;
  return {
    canvas,
    container,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

interface PointerOpts {
  altKey?: boolean;
  button?: number;
  ctrlKey?: boolean;
  pointerId?: number;
  pointerType?: string;
  pressure?: number;
  shiftKey?: boolean;
}

export function pointer(
  target: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  x: number,
  y: number,
  opts: PointerOpts = {},
): void {
  act(() => {
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        button: opts.button ?? 0,
        buttons: type === 'pointerup' ? 0 : 1,
        pointerId: opts.pointerId ?? 1,
        pointerType: opts.pointerType ?? 'mouse',
        pressure: opts.pressure ?? 0.5,
        shiftKey: opts.shiftKey ?? false,
        altKey: opts.altKey ?? false,
        ctrlKey: opts.ctrlKey ?? false,
      }),
    );
  });
}

export function drag(
  target: Element,
  from: [number, number],
  to: [number, number],
  opts: PointerOpts = {},
  steps = 3,
): void {
  pointer(target, 'pointerdown', from[0], from[1], opts);
  for (let i = 1; i <= steps; i++) {
    pointer(
      target,
      'pointermove',
      from[0] + ((to[0] - from[0]) * i) / steps,
      from[1] + ((to[1] - from[1]) * i) / steps,
      opts,
    );
  }
  pointer(target, 'pointerup', to[0], to[1], opts);
}

export function click(target: Element, x: number, y: number, opts: PointerOpts = {}): void {
  pointer(target, 'pointerdown', x, y, opts);
  pointer(target, 'pointerup', x, y, opts);
}

export function doubleClick(target: Element, x: number, y: number): void {
  act(() => {
    target.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: x, clientY: y }));
  });
}

export function wheel(target: Element, x: number, y: number, init: WheelEventInit): void {
  const event = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    ...init,
  });
  // happy-dom's WheelEvent ignores modifier keys and coordinates passed to its constructor.
  for (const k of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const) {
    Object.defineProperty(event, k, { value: !!init[k] });
  }
  Object.defineProperty(event, 'clientX', { value: x });
  Object.defineProperty(event, 'clientY', { value: y });
  act(() => {
    target.dispatchEvent(event);
  });
}

export function key(target: Element, keyName: string, init: KeyboardEventInit = {}): void {
  act(() => {
    target.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: keyName, ...init }),
    );
  });
}
