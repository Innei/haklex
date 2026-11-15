// @vitest-environment happy-dom
import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { newElement, newTextElement } from '../model/create';
import type { InteractiveSceneHandle, SceneViewport } from './InteractiveScene';
import { InteractiveScene } from './InteractiveScene';
import type { ExcalidrawScene } from './types';

const rect = (id: string, x: number, y: number) => ({
  ...newElement('rectangle', { x, y, width: 100, height: 50 }),
  id,
});

const scene = {
  type: 'excalidraw',
  elements: [
    rect('a', 0, 0),
    rect('b', 2000, 1000),
    { ...newTextElement({ text: 'hi', fontFamily: 5 }), id: 't', width: 20, height: 25 },
  ],
} as unknown as ExcalidrawScene;

let cleanup: (() => void) | undefined;
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 800,
    height: 600,
    left: 0,
    top: 0,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.restoreAllMocks();
});

function mount(node: React.ReactNode) {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement('div');
  document.body.append(container);
  let root: Root;
  act(() => {
    root = createRoot(container);
    root.render(node);
  });
  cleanup = () => {
    act(() => root.unmount());
    container.remove();
  };
  return container;
}

const toScreen = (v: SceneViewport, x: number, y: number) => [
  (x + v.scrollX) * v.zoom,
  (y + v.scrollY) * v.zoom,
];

describe('InteractiveScene as a host surface', () => {
  it('reports the fitted viewport in editor coordinates', () => {
    const seen: SceneViewport[] = [];
    mount(<InteractiveScene scene={scene} onViewportChange={(v) => seen.push(v)} />);
    const last = seen.at(-1)!;
    expect(last.width).toBe(800);
    expect(last.height).toBe(600);
    const [cx, cy] = toScreen(last, 1050, 525);
    expect(cx).toBeCloseTo(400);
    expect(cy).toBeCloseTo(300);
  });

  it('focuses the named elements through the handle', () => {
    const seen: SceneViewport[] = [];
    const ref = createRef<InteractiveSceneHandle>();
    mount(<InteractiveScene ref={ref} scene={scene} onViewportChange={(v) => seen.push(v)} />);
    let ok = false;
    act(() => {
      ok = ref.current!.focus(['b'], { zoomFactor: 0.5 });
    });
    expect(ok).toBe(true);
    const last = seen.at(-1)!;
    expect(last.zoom).toBeCloseTo(4);
    const [cx, cy] = toScreen(last, 2050, 1025);
    expect(cx).toBeCloseTo(400);
    expect(cy).toBeCloseTo(300);
    expect(ref.current!.getViewport().zoom).toBeCloseTo(4);
  });

  it('returns false when the focus target does not exist', () => {
    const ref = createRef<InteractiveSceneHandle>();
    mount(<InteractiveScene ref={ref} scene={scene} />);
    let ok = true;
    act(() => {
      ok = ref.current!.focus(['missing']);
    });
    expect(ok).toBe(false);
  });

  it('opens at the given viewport instead of fitting', () => {
    const seen: SceneViewport[] = [];
    mount(
      <InteractiveScene
        initialViewport={{ scrollX: 10, scrollY: 20, zoom: 2 }}
        scene={scene}
        onViewportChange={(v) => seen.push(v)}
      />,
    );
    expect(seen.at(-1)).toMatchObject({ scrollX: 10, scrollY: 20, zoom: 2 });
  });

  it('hides the zoom controls on request and keeps them by default', () => {
    const hidden = mount(<InteractiveScene controls={false} scene={scene} />);
    expect(hidden.querySelector('[aria-label="Zoom in"]')).toBeNull();
    cleanup?.();
    const shown = mount(<InteractiveScene scene={scene} />);
    expect(shown.querySelector('[aria-label="Zoom in"]')).not.toBeNull();
  });

  it('draws handwritten text with the host override', () => {
    const container = mount(<InteractiveScene handFontOverride="Readable" scene={scene} />);
    expect(container.querySelector('[data-id="t"] text')?.getAttribute('font-family')).toBe(
      'Readable',
    );
  });
});
