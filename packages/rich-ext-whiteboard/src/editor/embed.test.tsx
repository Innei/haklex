// @vitest-environment happy-dom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import { key } from '../../tests/harness';
import { newElement, newTextElement } from '../model/create';
import { placeCard, setTool } from './card-actions';
import { focusElements } from './focus';
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
  ...newElement('rectangle', { x, y, width: 100, height: 50 }),
  id,
});

describe('embedding the editor', () => {
  it('renders no built-in chrome when every part is switched off', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0)] });
    store.setState({ selectedIds: new Set(['a']) });
    const { container } = mount({
      store,
      chrome: { toolbar: false, stylePanel: false, zoom: false, mobileDock: false },
    });
    expect(container.querySelector('[role="toolbar"]')).toBeNull();
    expect(container.querySelector('[data-style-panel]')).toBeNull();
    expect(container.querySelector('[data-style-sheet]')).toBeNull();
    expect(container.querySelector('[aria-label="Undo"]')).toBeNull();
    expect(container.querySelector('[data-mobile-dock]')).toBeNull();
  });

  it('keeps the built-in chrome by default', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0)] });
    const { container } = mount({ store });
    expect(container.querySelector('[role="toolbar"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Undo"]')).not.toBeNull();
  });

  it('ignores the shortcut of a tool the host did not allow', () => {
    const store = createWhiteboardStore({ elements: [] });
    const { canvas } = mount({ store, tools: ['selection', 'rectangle'] });
    key(canvas, 'i');
    expect(store.getState().tool).toBe('selection');
    key(canvas, 'r');
    expect(store.getState().tool).toBe('rectangle');
  });

  it('shows only allowed tools in the built-in toolbar', () => {
    const store = createWhiteboardStore({ elements: [] });
    const { container } = mount({ store, tools: ['selection', 'rectangle'] });
    const shown = [...container.querySelectorAll('[data-tool]')].map((n) =>
      n.getAttribute('data-tool'),
    );
    expect(shown).toEqual(['selection', 'rectangle']);
  });

  it('draws handwritten text with the host override', () => {
    const text = {
      ...newTextElement({ text: 'hi', fontFamily: 5 }),
      id: 't',
      width: 20,
      height: 25,
    };
    const store = createWhiteboardStore({ elements: [text] });
    const { container } = mount({ store, handFontOverride: 'Readable' });
    expect(container.querySelector('[data-id="t"] text')?.getAttribute('font-family')).toBe(
      'Readable',
    );
  });
});

describe('host actions', () => {
  it('placeCard drops a default card centred on the point and starts editing it', () => {
    const store = createWhiteboardStore({ elements: [] });
    const id = placeCard(store, [300, 200]);
    const state = store.getState();
    const card = state.elements.find((el) => el.id === id)!;
    expect(card.type).toBe('richtext');
    expect(card.x + card.width / 2).toBe(300);
    expect(card.y + card.height / 2).toBe(200);
    expect([...state.selectedIds]).toEqual([id]);
    expect(state.editingRichTextId).toBe(id);
    store.undo();
    expect(store.getState().elements.filter((el) => !el.isDeleted)).toHaveLength(0);
    expect(store.canUndo()).toBe(false);
  });

  it('setTool switches tool and clears the selection for drawing tools', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0)] });
    store.setState({ selectedIds: new Set(['a']) });
    setTool(store, 'arrow');
    expect(store.getState().tool).toBe('arrow');
    expect(store.getState().selectedIds.size).toBe(0);
  });
});

describe('focusElements', () => {
  const center = (store: ReturnType<typeof createWhiteboardStore>, point: [number, number]) => {
    const { viewport } = store.getState();
    return [
      (point[0] + viewport.scrollX) * viewport.zoom,
      (point[1] + viewport.scrollY) * viewport.zoom,
    ];
  };

  it('centres the named elements in the canvas', () => {
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0), rect('b', 1000, 600)] });
    store.setState({ canvasSize: { width: 800, height: 600 } });
    focusElements(store, ['b']);
    expect(center(store, [1050, 625])).toEqual([400, 300]);
  });

  it('fits the bounds inside the insets scaled by the zoom factor', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ canvasSize: { width: 1000, height: 700 } });
    focusElements(store, [0, 0, 400, 300], {
      zoomFactor: 0.5,
      insets: { top: 100, right: 0, bottom: 0, left: 200 },
    });
    expect(store.getState().viewport.zoom).toBeCloseTo(1);
    expect(center(store, [200, 150])).toEqual([600, 400]);
  });

  it('fits everything alive when given null', () => {
    const gone = { ...rect('z', 9000, 9000), isDeleted: true };
    const store = createWhiteboardStore({ elements: [rect('a', 0, 0), gone] });
    store.setState({ canvasSize: { width: 800, height: 600 } });
    focusElements(store, null);
    expect(center(store, [50, 25])).toEqual([400, 300]);
  });

  it('leaves the viewport alone when nothing matches', () => {
    const store = createWhiteboardStore({ elements: [] });
    store.setState({ canvasSize: { width: 800, height: 600 } });
    const before = store.getState().viewport;
    expect(focusElements(store, ['missing'])).toBe(false);
    expect(store.getState().viewport).toBe(before);
  });

  it('fits the content once the canvas is measured, unless the host places the viewport itself', () => {
    const fitted = createWhiteboardStore({ elements: [rect('a', 2000, 2000)] });
    mount({ store: fitted });
    act(() => fitted.setState({ canvasSize: { width: 800, height: 600 } }));
    expect(fitted.getState().viewport.scrollX).not.toBe(0);
    cleanup?.();

    const kept = createWhiteboardStore({ elements: [rect('a', 2000, 2000)] });
    mount({ store: kept, initialFit: false });
    act(() => kept.setState({ canvasSize: { width: 800, height: 600 } }));
    expect(kept.getState().viewport).toEqual({ scrollX: 0, scrollY: 0, zoom: 1 });
  });
});
