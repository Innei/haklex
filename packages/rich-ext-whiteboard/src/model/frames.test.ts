import { describe, expect, it } from 'vitest';

import type { ExcalidrawElement } from '../scene/types';
import { newElement, newFrameElement } from './create';
import { assignFrameMembership, getFrameChildren, updateFrameMembershipAfterMove } from './frames';

const frame = () =>
  ({ ...newFrameElement({ x: 0, y: 0, width: 200, height: 200 }), id: 'f' }) as ExcalidrawElement;
const rect = (id: string, x: number, y: number, frameId: string | null = null) =>
  ({
    ...newElement('rectangle', { x, y, width: 50, height: 50 }),
    id,
    frameId,
  }) as ExcalidrawElement;

const frameIdOf = (els: ExcalidrawElement[], id: string) => els.find((el) => el.id === id)!.frameId;

describe('frames', () => {
  it('adopts elements fully inside the frame only', () => {
    const els = assignFrameMembership([frame(), rect('in', 10, 10), rect('half', 180, 10)], 'f');
    expect(frameIdOf(els, 'in')).toBe('f');
    expect(frameIdOf(els, 'half')).toBeNull();
    expect(getFrameChildren(els, 'f').map((el) => el.id)).toEqual(['in']);
  });

  it('releases children that are no longer inside', () => {
    const els = assignFrameMembership([frame(), rect('out', 500, 500, 'f')], 'f');
    expect(frameIdOf(els, 'out')).toBeNull();
  });

  it('does not take elements that belong to another frame', () => {
    const els = assignFrameMembership([frame(), rect('other', 10, 10, 'g')], 'f');
    expect(frameIdOf(els, 'other')).toBe('g');
  });

  it('keeps an overhanging child while it still overlaps the frame', () => {
    const els = [frame(), rect('over', 180, 10, 'f')];
    const nudged = els.map((el) => (el.id === 'over' ? { ...el, x: 181 } : el));
    expect(frameIdOf(updateFrameMembershipAfterMove(nudged, new Set(['over'])), 'over')).toBe('f');
    expect(frameIdOf(assignFrameMembership(els, 'f'), 'over')).toBe('f');
    const gone = els.map((el) => (el.id === 'over' ? { ...el, x: 400 } : el));
    expect(frameIdOf(updateFrameMembershipAfterMove(gone, new Set(['over'])), 'over')).toBeNull();
  });

  it('updates membership of moved elements', () => {
    const els = [frame(), rect('a', 300, 300), rect('b', 300, 300, 'f')];
    const moved = els.map((el) => (el.id === 'a' ? { ...el, x: 20, y: 20 } : el));
    const next = updateFrameMembershipAfterMove(moved, new Set(['a', 'b']));
    expect(frameIdOf(next, 'a')).toBe('f');
    expect(frameIdOf(next, 'b')).toBeNull();
  });

  it('keeps bound text in its container frame', () => {
    const box = { ...rect('box', 10, 10), boundElements: [{ id: 't', type: 'text' }] };
    const text = {
      ...newElement('rectangle', { x: 20, y: 20, width: 10, height: 10 }),
      type: 'text',
      id: 't',
      containerId: 'box',
      frameId: null,
    } as unknown as ExcalidrawElement;
    const next = assignFrameMembership([frame(), box, text], 'f');
    expect(frameIdOf(next, 't')).toBe('f');
  });
});
