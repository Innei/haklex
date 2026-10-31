import type { NodeKey } from 'lexical';

import type { RevealSegment } from './plan';

export interface QueueOptions {
  backlogSeconds: number;
  charsPerSecond: number;
  maxSeconds: number;
}

export type QueueCaret =
  { kind: 'text'; blockKey: NodeKey; offset: number } | { kind: 'block'; blockKey: NodeKey };

export interface PendingSegment {
  revealed: number;
  segment: RevealSegment;
}

export interface QueueSnapshot {
  caret: QueueCaret | null;
  idle: boolean;
  pending: PendingSegment[];
}

export interface RevealQueue {
  advance: (seconds: number) => void;
  enqueue: (segments: RevealSegment[]) => void;
  finish: () => void;
  invalidate: (blockKey: NodeKey) => void;
  snapshot: () => QueueSnapshot;
}

interface Entry {
  progress: number;
  rate: number;
  segment: RevealSegment;
  size: number;
}

const EPSILON = 1e-9;

const sizeOf = (segment: RevealSegment) =>
  segment.kind === 'text' ? segment.to - segment.from : 1;

const caretOf = (entry: Entry): QueueCaret =>
  entry.segment.kind === 'text'
    ? {
        kind: 'text',
        blockKey: entry.segment.blockKey,
        offset: entry.segment.from + Math.floor(entry.progress),
      }
    : { kind: 'block', blockKey: entry.segment.blockKey };

export function createRevealQueue(getOptions: () => QueueOptions): RevealQueue {
  let entries: Entry[] = [];
  let caret: QueueCaret | null = null;

  const complete = (entry: Entry) => {
    entry.progress = entry.size;
    caret = caretOf(entry);
  };

  const prune = () => {
    entries = entries.filter((entry) => entry.progress < entry.size - EPSILON);
  };

  const mergeIntoPending = (segment: RevealSegment): boolean => {
    if (segment.kind !== 'text') return false;
    const same = entries.filter((entry) => entry.segment.blockKey === segment.blockKey);
    const entry = same.length === 1 ? same[0]! : undefined;
    if (entry?.segment.kind !== 'text') {
      for (const stale of same) complete(stale);
      return false;
    }
    const old = entry.segment;
    const hiddenFrom = old.from + Math.floor(entry.progress);
    if (segment.from < hiddenFrom) {
      complete(entry);
      return false;
    }
    if (segment.from > old.to) return false;
    const shiftedEnd = old.to + segment.text.length - old.text.length;
    const to = Math.max(segment.to, shiftedEnd);
    entry.segment = { ...old, to, text: segment.text };
    entry.size = to - old.from;
    return true;
  };

  const remainingSeconds = () =>
    entries.reduce((sum, entry) => sum + (entry.size - entry.progress) / entry.rate, 0);

  return {
    enqueue(segments) {
      if (segments.length === 0) return;
      const { backlogSeconds, charsPerSecond, maxSeconds } = getOptions();
      const total = segments.reduce((sum, segment) => sum + sizeOf(segment), 0);
      const rate = Math.max(charsPerSecond, total / maxSeconds);
      if (remainingSeconds() + total / rate > backlogSeconds + EPSILON) {
        for (const entry of entries) complete(entry);
        entries = [];
      }
      for (const segment of segments) {
        if (mergeIntoPending(segment)) continue;
        entries.push({ progress: 0, rate, segment, size: sizeOf(segment) });
      }
      prune();
    },
    advance(seconds) {
      let time = seconds;
      for (const entry of entries) {
        if (time <= 0) break;
        const needed = (entry.size - entry.progress) / entry.rate;
        if (time + EPSILON >= needed) {
          time -= needed;
          complete(entry);
        } else {
          entry.progress += entry.rate * time;
          time = 0;
          if (entry.progress >= 1) caret = caretOf(entry);
        }
      }
      prune();
    },
    finish() {
      entries = [];
      caret = null;
    },
    invalidate(blockKey) {
      for (const entry of entries) {
        if (entry.segment.blockKey === blockKey) complete(entry);
      }
      prune();
    },
    snapshot() {
      return {
        caret,
        idle: entries.length === 0,
        pending: entries.map((entry) => ({
          revealed: Math.floor(entry.progress + EPSILON),
          segment: entry.segment,
        })),
      };
    },
  };
}
