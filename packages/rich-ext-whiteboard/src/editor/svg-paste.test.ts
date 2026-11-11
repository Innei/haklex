import { describe, expect, it } from 'vitest';

import type { SvgElement } from '../scene/types';
import { pasteFromClipboard } from './clipboard-actions';
import { createWhiteboardStore } from './store';

const pasted = (raw: string) => {
  const store = createWhiteboardStore({ elements: [] });
  const ok = pasteFromClipboard(store, raw, [500, 400]);
  return { ok, store, el: store.getState().elements[0] as SvgElement | undefined };
};

describe('pasting svg text', () => {
  it('creates one svg element centred on the paste point, capped at 600', () => {
    const { ok, store, el } = pasted('  <svg viewBox="0 0 1200 600"><circle r="4"/></svg>\n');
    expect(ok).toBe(true);
    expect(el).toMatchObject({ type: 'svg', width: 600, height: 300, x: 200, y: 250 });
    expect(el!.svg).toContain('<circle r="4"/>');
    expect(store.getState().selectedIds).toEqual(new Set([el!.id]));
    store.undo();
    expect(store.getState().elements.filter((e) => !e.isDeleted)).toHaveLength(0);
  });

  it('keeps a small svg at its own size', () => {
    const { el } = pasted('<svg width="48" height="96"></svg>');
    expect(el).toMatchObject({ type: 'svg', width: 48, height: 96 });
  });

  it('falls back to 200 when the svg declares no size', () => {
    const { el } = pasted('<svg><rect/></svg>');
    expect(el).toMatchObject({ type: 'svg', width: 200, height: 200 });
  });

  it('still pastes other text as a text element', () => {
    const { el } = pasted('hello <svg>');
    expect(el?.type).toBe('text');
  });
});
