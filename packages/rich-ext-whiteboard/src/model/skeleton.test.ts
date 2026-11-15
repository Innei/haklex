import { describe, expect, it } from 'vitest';

import type { ExcalidrawElement, LinearElement, TextElement } from '../scene/types';
import { newElement } from './create';
import { isValidIndex } from './fractional-index';
import { paragraphs } from './richtext';
import { convertSkeletons } from './skeleton';

const find = <T extends ExcalidrawElement>(list: readonly ExcalidrawElement[], id: string) =>
  list.find((el) => el.id === id) as T;

const box = (id: string, x: number, extra: Record<string, unknown> = {}) => ({
  id,
  type: 'rectangle',
  x,
  y: 0,
  width: 180,
  height: 80,
  ...extra,
});

describe('convertSkeletons', () => {
  it('turns a shape label into a bound, centred text element', () => {
    const { created } = convertSkeletons([box('a', 0, { label: { text: 'Queue' } })], []);
    const shape = find(created, 'a');
    const label = created.find((el) => el.type === 'text') as TextElement;
    expect(label.containerId).toBe('a');
    expect(label.originalText).toBe('Queue');
    expect(shape.boundElements).toEqual([{ id: label.id, type: 'text' }]);
    expect(label.x + label.width / 2).toBeCloseTo(90);
    expect(label.y + label.height / 2).toBeCloseTo(40);
    expect('label' in shape).toBe(false);
  });

  it('wraps a long label inside the container width', () => {
    const { created } = convertSkeletons(
      [box('a', 0, { width: 100, label: { text: 'alpha beta gamma delta epsilon' } })],
      [],
    );
    const label = created.find((el) => el.type === 'text') as TextElement;
    expect(label.text.split('\n').length).toBeGreaterThan(1);
    expect(label.width).toBeLessThanOrEqual(90);
  });

  it('puts an arrow label at the middle of the arrow', () => {
    const { created } = convertSkeletons(
      [{ id: 'r', type: 'arrow', x: 0, y: 0, width: 200, height: 0, label: { text: 'calls' } }],
      [],
    );
    const label = created.find((el) => el.type === 'text') as TextElement;
    expect(label.containerId).toBe('r');
    expect(label.x + label.width / 2).toBeCloseTo(100);
    expect(find(created, 'r').boundElements).toEqual([{ id: label.id, type: 'text' }]);
  });

  it('measures free text', () => {
    const { created } = convertSkeletons(
      [{ id: 't', type: 'text', x: 0, y: 0, text: 'hello\nworld', fontSize: 20 }],
      [],
    );
    const text = find<TextElement>(created, 't');
    expect(text.width).toBeGreaterThan(0);
    expect(text.height).toBeCloseTo(50);
    expect(text.originalText).toBe('hello\nworld');
  });

  it('binds arrow ends to shapes in the same batch', () => {
    const { created } = convertSkeletons(
      [
        box('a', 0),
        box('b', 320),
        {
          id: 'r',
          type: 'arrow',
          x: 180,
          y: 40,
          width: 140,
          height: 0,
          start: { id: 'a' },
          end: { id: 'b' },
        },
      ],
      [],
    );
    const arrow = find<LinearElement>(created, 'r');
    expect(arrow.startBinding?.elementId).toBe('a');
    expect(arrow.endBinding?.elementId).toBe('b');
    expect(find(created, 'a').boundElements).toEqual([{ id: 'r', type: 'arrow' }]);
    expect(find(created, 'b').boundElements).toEqual([{ id: 'r', type: 'arrow' }]);
    expect('start' in arrow).toBe(false);
  });

  it('binds to an element already in the scene and reports it as touched', () => {
    const existing = {
      ...newElement('rectangle', { x: 320, y: 0, width: 180, height: 80 }),
      id: 'b',
    };
    const { created, touched } = convertSkeletons(
      [{ id: 'r', type: 'arrow', x: 180, y: 40, width: 140, height: 0, end: { id: 'b' } }],
      [existing],
    );
    expect(created.map((el) => el.id)).toEqual(['r']);
    expect(touched).toHaveLength(1);
    expect(touched[0].boundElements).toEqual([{ id: 'r', type: 'arrow' }]);
    expect(touched[0].version).toBeGreaterThan(existing.version!);
  });

  it('gives a skeleton that replaces an element a version above the one it replaces', () => {
    const existing = {
      ...newElement('rectangle', { x: 0, y: 0, width: 180, height: 80 }),
      id: 'b',
      version: 9,
      versionNonce: 4,
    };
    const { created } = convertSkeletons([box('b', 40)], [existing]);
    expect(created[0].version).toBe(10);
    expect(created[0].versionNonce).not.toBe(4);
    const kept = convertSkeletons([box('b', 40, { version: 30 })], [existing]);
    expect(kept.created[0].version).toBe(30);
  });

  it('ignores a binding whose target is missing or deleted', () => {
    const gone = {
      ...newElement('rectangle', { x: 0, y: 0, width: 10, height: 10 }),
      id: 'b',
      isDeleted: true,
    };
    const { created, touched } = convertSkeletons(
      [
        {
          id: 'r',
          type: 'arrow',
          x: 0,
          y: 0,
          width: 50,
          height: 0,
          start: { id: 'nope' },
          end: { id: 'b' },
        },
      ],
      [gone],
    );
    const arrow = find<LinearElement>(created, 'r');
    expect(arrow.startBinding).toBeNull();
    expect(arrow.endBinding).toBeNull();
    expect(touched).toHaveLength(0);
  });

  it('derives points from a negative or zero arrow size', () => {
    const { created } = convertSkeletons(
      [{ id: 'r', type: 'arrow', x: 100, y: 100, width: -60, height: 0 }],
      [],
    );
    const arrow = find<LinearElement>(created, 'r');
    expect(arrow.points).toEqual([
      [0, 0],
      [-60, 0],
    ]);
    expect(arrow.width).toBe(60);
    expect(arrow.height).toBe(0);
  });

  it('puts frame children and their labels in the frame and fits it with padding', () => {
    const { created } = convertSkeletons(
      [
        { id: 'f', type: 'frame', name: 'Flow', children: ['a', 'b'] },
        box('a', 0, { label: { text: 'A' } }),
        box('b', 320),
        box('c', 900),
        {
          id: 'r',
          type: 'arrow',
          x: 500,
          y: 40,
          width: 400,
          height: 0,
          start: { id: 'b' },
          end: { id: 'c' },
        },
      ],
      [],
    );
    const frame = find(created, 'f');
    expect(find(created, 'a').frameId).toBe('f');
    expect(find(created, 'b').frameId).toBe('f');
    expect(created.find((el) => el.type === 'text')!.frameId).toBe('f');
    expect(find(created, 'c').frameId).toBeNull();
    expect(find(created, 'r').frameId).toBeNull();
    expect([frame.x, frame.y, frame.width, frame.height]).toEqual([-10, -10, 520, 100]);
    expect('children' in frame).toBe(false);
  });

  it('keeps an explicit frame size and adopts scene elements as children', () => {
    const existing = {
      ...newElement('rectangle', { x: 20, y: 20, width: 50, height: 50 }),
      id: 'old',
    };
    const { created, touched } = convertSkeletons(
      [{ id: 'f', type: 'frame', x: 0, y: 0, width: 400, height: 300, children: ['old'] }],
      [existing],
    );
    const frame = find(created, 'f');
    expect([frame.x, frame.y, frame.width, frame.height]).toEqual([0, 0, 400, 300]);
    expect(touched[0].frameId).toBe('f');
    expect(touched[0].version).toBeGreaterThan(existing.version!);
  });

  it('sizes an svg from its viewBox and falls back to 100', () => {
    const { created } = convertSkeletons(
      [
        { id: 's', type: 'svg', x: 0, y: 0, svg: '<svg viewBox="0 0 48 96"><rect/></svg>' },
        { id: 'u', type: 'svg', x: 0, y: 0, svg: '<svg><rect/></svg>' },
        {
          id: 'k',
          type: 'svg',
          x: 0,
          y: 0,
          width: 30,
          height: 20,
          svg: '<svg viewBox="0 0 48 96"/>',
        },
      ],
      [],
    );
    expect([find(created, 's').width, find(created, 's').height]).toEqual([48, 96]);
    expect([find(created, 'u').width, find(created, 'u').height]).toEqual([100, 100]);
    expect([find(created, 'k').width, find(created, 'k').height]).toEqual([30, 20]);
    expect((find(created, 's') as { svg: string }).svg).toContain('xmlns=');
  });

  it('keeps card content, applies card defaults and grows to fit', () => {
    const content = paragraphs(['one', 'two', 'three', 'four']);
    const { created } = convertSkeletons(
      [{ id: 'c', type: 'richtext', x: 0, y: 0, width: 200, height: 10, content }],
      [],
    );
    const card = find(created, 'c') as ExcalidrawElement & { content: unknown };
    expect(card.content).toEqual(content);
    expect(card.backgroundColor).toBe('#ffec99');
    expect(card.height).toBeGreaterThan(10);
  });

  it('preserves ids and customData and fills the full field set', () => {
    const existing = {
      ...newElement('rectangle', { x: 0, y: 0, width: 1, height: 1 }),
      id: 'z',
      index: 'a5',
    };
    const { created } = convertSkeletons(
      [box('a', 0, { customData: { ryugiAuthor: 'agent' } }), box('b', 300)],
      [existing],
    );
    const a = find(created, 'a');
    expect(a.customData).toEqual({ ryugiAuthor: 'agent' });
    expect(a.version).toBeGreaterThanOrEqual(1);
    expect(typeof a.seed).toBe('number');
    expect(typeof a.versionNonce).toBe('number');
    expect(a.groupIds).toEqual([]);
    expect(isValidIndex(a.index)).toBe(true);
    expect(a.index! > 'a5').toBe(true);
    expect(find(created, 'b').index! > a.index!).toBe(true);
  });
});
