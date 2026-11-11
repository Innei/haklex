// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { mountEditor } from '../../tests/harness';
import { newElement, newLinearElement } from '../model/create';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const shadowRow = () => mounted!.container.querySelector('[data-style-row="shadow"]');

describe('shadow row in the style panel', () => {
  it('turns the shadow on for the selected rectangle in one history entry', () => {
    const rect = newElement('rectangle', { x: 0, y: 0, width: 100, height: 60 });
    const store = createWhiteboardStore({ elements: [rect] });
    mounted = mountEditor(store);
    act(() => store.setState({ selectedIds: new Set([rect.id]) }));
    const on = [...shadowRow()!.querySelectorAll<HTMLElement>('[role="tab"]')].find(
      (tab) => tab.textContent === 'Soft',
    );
    expect(on).toBeDefined();
    act(() => on!.click());
    expect(store.getState().elements[0].shadow).toBe(true);
    act(() => store.undo());
    expect(store.getState().elements[0].shadow).toBeFalsy();
  });

  it('has no shadow row for a line', () => {
    const line = newLinearElement('line', { x: 0, y: 0 });
    const store = createWhiteboardStore({ elements: [line] });
    mounted = mountEditor(store);
    act(() => store.setState({ selectedIds: new Set([line.id]) }));
    expect(mounted.container.querySelector('[data-style-row]')).not.toBeNull();
    expect(shadowRow()).toBeNull();
  });
});
