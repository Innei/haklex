import { describe, expect, it } from 'vitest';

import type { RevealSegment } from '../src/plan';
import { createRevealQueue } from '../src/queue';

const options = { charsPerSecond: 80, maxSeconds: 3, backlogSeconds: 6 };

const text = (blockKey: string, length: number, from = 0): RevealSegment => ({
  kind: 'text',
  blockKey,
  from,
  to: from + length,
  text: 'x'.repeat(from + length),
});

const block = (blockKey: string): RevealSegment => ({ kind: 'block', blockKey });

const revealed = (queue: ReturnType<typeof createRevealQueue>) =>
  queue.snapshot().pending.map((p) => [p.segment.blockKey, p.revealed]);

describe('createRevealQueue', () => {
  it('reveals at the base speed', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 100)]);
    queue.advance(0.5);
    expect(revealed(queue)).toEqual([['a', 40]]);
  });

  it('speeds up a long write to fit the per-write limit', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 600)]);
    queue.advance(1.5);
    expect(revealed(queue)).toEqual([['a', 300]]);
  });

  it('counts a block segment as one character', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([block('img'), text('b', 10)]);
    queue.advance(1 / 80);
    expect(revealed(queue)).toEqual([['b', 0]]);
    expect(queue.snapshot().caret).toEqual({ blockKey: 'img', kind: 'block' });
  });

  it('carries leftover time into the next segment', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 40), text('b', 40)]);
    queue.advance(0.75);
    expect(revealed(queue)).toEqual([['b', 20]]);
  });

  it('plays a second write after the first', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 80)]);
    queue.advance(0.5);
    queue.enqueue([text('b', 40)]);
    queue.advance(0.5);
    expect(revealed(queue)).toEqual([['b', 0]]);
    queue.advance(0.25);
    expect(revealed(queue)).toEqual([['b', 20]]);
  });

  it('shows earlier writes at once when the backlog would exceed the limit', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 400)]);
    queue.enqueue([text('b', 400)]);
    expect(revealed(queue)).toEqual([
      ['a', 0],
      ['b', 0],
    ]);
    queue.enqueue([text('c', 80)]);
    expect(revealed(queue)).toEqual([['c', 0]]);
  });

  it('places the caret after the last revealed character', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 100, 5)]);
    queue.advance(0.25);
    expect(queue.snapshot().caret).toEqual({ blockKey: 'a', kind: 'text', offset: 25 });
  });

  it('keeps the caret at the end of the last segment after playback completes', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 40, 3)]);
    queue.advance(1);
    expect(queue.snapshot()).toEqual({
      caret: { blockKey: 'a', kind: 'text', offset: 43 },
      idle: true,
      pending: [],
    });
  });

  it('extends a playing block when a later write appends to it', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 10)]);
    queue.advance(0.05);
    queue.enqueue([text('a', 10, 10)]);
    queue.advance(0.1);
    expect(queue.snapshot().pending.map((p) => [p.revealed, p.segment])).toEqual([
      [12, { kind: 'text', blockKey: 'a', from: 0, to: 20, text: 'x'.repeat(20) }],
    ]);
  });

  it('shows a block at once when a later write rewrites its revealed part', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 10)]);
    queue.advance(0.0625);
    queue.enqueue([{ kind: 'text', blockKey: 'a', from: 2, to: 6, text: 'x'.repeat(12) }]);
    expect(
      queue
        .snapshot()
        .pending.map((p) => [p.revealed, p.segment.kind === 'text' && p.segment.from]),
    ).toEqual([[0, 2]]);
  });

  it('becomes idle when finished', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 100), block('img')]);
    queue.finish();
    expect(queue.snapshot()).toEqual({ caret: null, idle: true, pending: [] });
  });

  it('completes only the invalidated block', () => {
    const queue = createRevealQueue(() => options);
    queue.enqueue([text('a', 50), text('b', 50)]);
    queue.invalidate('a');
    queue.advance(0.25);
    expect(revealed(queue)).toEqual([['b', 20]]);
  });
});
