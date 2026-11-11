// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { mountEditor } from '../../tests/harness';
import { isBindable } from '../model/bindable';
import { newSvgElement } from '../model/create';
import { createWhiteboardStore } from './store';
import { resizeElements } from './transform';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

const sticker = () =>
  newSvgElement({ x: 0, y: 0, width: 50, height: 100, svg: '<svg viewBox="0 0 1 2"/>' });

describe('svg element in the editor', () => {
  it('offers shadow, opacity and layers but no stroke or fill', () => {
    const el = sticker();
    const store = createWhiteboardStore({ elements: [el] });
    mounted = mountEditor(store);
    act(() => store.setState({ selectedIds: new Set([el.id]) }));
    const { container } = mounted;
    expect(container.querySelector('[data-style-row="shadow"]')).not.toBeNull();
    expect(container.querySelector('input[aria-label="Opacity"]')).not.toBeNull();
    expect(container.querySelector('[data-swatch^="strokeColor"]')).toBeNull();
    expect(container.querySelector('[data-swatch^="backgroundColor"]')).toBeNull();
  });

  it('keeps its aspect ratio on a corner resize', () => {
    const [resized] = resizeElements([sticker()], 'se', [50, 100], [150, 120], {});
    expect(resized.width / resized.height).toBeCloseTo(0.5);
  });

  it('accepts arrow bindings', () => {
    expect(isBindable(sticker())).toBe(true);
  });
});
