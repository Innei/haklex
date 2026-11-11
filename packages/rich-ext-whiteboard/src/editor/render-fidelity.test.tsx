// @vitest-environment happy-dom
import { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import type { Mounted } from '../../tests/harness';
import { click, doubleClick, mountEditor } from '../../tests/harness';
import { newLinearElement, newTextElement } from '../model/create';
import { DARK_SCENE_FILTER, SceneContent } from '../scene/Scene';
import { createWhiteboardStore } from './store';

let mounted: Mounted | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
});

describe('render fidelity', () => {
  it('rotates a line drawn leftward about the centre its selection box uses', () => {
    const line = newLinearElement('line', {
      x: 100,
      y: 0,
      width: 100,
      height: 40,
      angle: 0.5,
      points: [
        [0, 0],
        [-100, 0],
        [-100, -40],
      ],
    });
    const html = renderToStaticMarkup(
      <svg>
        <SceneContent dark={false} scene={{ elements: [line] }} />
      </svg>,
    );
    const rotate = /rotate\([-\d.]+ ([-\d.]+) ([-\d.]+)\)/.exec(html)!;
    expect(Number(rotate[1])).toBeCloseTo(-50);
    expect(Number(rotate[2])).toBeCloseTo(-20);
  });

  it('places and selects elements written without angle or strokeWidth', () => {
    const bare = {
      id: 'bare',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 120,
      strokeColor: '#1971c2',
      backgroundColor: '#a5d8ff',
      fillStyle: 'solid',
      roughness: 1,
      opacity: 100,
      seed: 1,
    };
    const html = renderToStaticMarkup(
      <svg>
        <SceneContent dark={false} scene={{ elements: [bare as never] }} />
      </svg>,
    );
    expect(html).not.toContain('NaN');
    expect(html).toContain('translate(100 100) rotate(0 100 60)');

    const store = createWhiteboardStore({ elements: [bare] });
    mounted = mountEditor(store);
    click(mounted.canvas, 150, 150);
    expect([...store.getState().selectedIds]).toEqual(['bare']);
    expect(store.getScene().elements[0]).toEqual(bare);
  });

  it('centres existing content when the editor first gets its size', () => {
    const far = { ...newTextElement({ text: 'far', x: 2000, y: 1500 }), width: 100, height: 40 };
    const store = createWhiteboardStore({ elements: [far] });
    mounted = mountEditor(store);
    act(() => store.setState({ canvasSize: { width: 800, height: 600 } }));
    const { viewport } = store.getState();
    expect(viewport.zoom).toBe(1);
    expect((2050 + viewport.scrollX) * viewport.zoom).toBeCloseTo(400);
    expect((1520 + viewport.scrollY) * viewport.zoom).toBeCloseTo(300);
    act(() => store.setState({ canvasSize: { width: 900, height: 600 } }));
    expect(store.getState().viewport).toEqual(viewport);
    expect(store.isDirty()).toBe(false);
  });

  it('shows text being edited in the same colours as the dark scene', () => {
    const text = { ...newTextElement({ text: 'hi', x: 0, y: 0 }), id: 't' };
    const store = createWhiteboardStore({ elements: [text] });
    mounted = mountEditor(store, { theme: 'dark' });
    doubleClick(mounted.canvas, 5, 5);
    const textarea = mounted.container.querySelector<HTMLTextAreaElement>(
      '[data-whiteboard-text-editor]',
    )!;
    expect(textarea).not.toBeNull();
    expect(textarea.style.filter).toBe(DARK_SCENE_FILTER);
  });
});
