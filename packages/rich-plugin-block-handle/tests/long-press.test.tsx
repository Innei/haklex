// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { LONG_PRESS_DELAY, useLongPress } from '../src/useLongPress';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
  vi.useRealTimers();
});

function Target({ onLongPress }: { onLongPress: () => void }) {
  const handlers = useLongPress(onLongPress);
  return <button type="button" {...handlers} />;
}

function pointer(type: string, init: Partial<PointerEventInit>) {
  return new PointerEvent(type, { bubbles: true, pointerId: 1, ...init });
}

async function mount(onLongPress: () => void) {
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(<Target onLongPress={onLongPress} />));
  return container.querySelector('button')!;
}

describe('useLongPress', () => {
  it('fires after a held touch', async () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const button = await mount(onLongPress);
    act(() => {
      button.dispatchEvent(
        pointer('pointerdown', { pointerType: 'touch', clientX: 0, clientY: 0 }),
      );
    });
    act(() => vi.advanceTimersByTime(LONG_PRESS_DELAY));
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('ignores mouse presses and touches that move', async () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const button = await mount(onLongPress);
    act(() => {
      button.dispatchEvent(pointer('pointerdown', { pointerType: 'mouse' }));
    });
    act(() => vi.advanceTimersByTime(LONG_PRESS_DELAY));
    act(() => {
      button.dispatchEvent(
        pointer('pointerdown', { pointerType: 'touch', clientX: 0, clientY: 0 }),
      );
      button.dispatchEvent(
        pointer('pointermove', { pointerType: 'touch', clientX: 20, clientY: 0 }),
      );
    });
    act(() => vi.advanceTimersByTime(LONG_PRESS_DELAY));
    expect(onLongPress).not.toHaveBeenCalled();
  });
});
