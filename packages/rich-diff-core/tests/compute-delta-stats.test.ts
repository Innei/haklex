import { describe, expect, it } from 'vitest';

import { computeDeltaStats, formatDeltaStats } from '../src';

function makeDoc(children: any[]) {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  };
}

function makeParagraph(text: string) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
  };
}

describe('computeDeltaStats', () => {
  it('returns zero for identical documents', () => {
    const doc = makeDoc([makeParagraph('Hello')]);
    const stats = computeDeltaStats(doc, doc);
    expect(stats.chars.added).toBe(0);
    expect(stats.chars.removed).toBe(0);
    expect(stats.words.added).toBe(0);
    expect(stats.words.removed).toBe(0);
    expect(stats.lines.added).toBe(0);
    expect(stats.lines.removed).toBe(0);
  });

  it('counts added characters', () => {
    const old = makeDoc([makeParagraph('Hello')]);
    const next = makeDoc([makeParagraph('Hello World')]);
    const stats = computeDeltaStats(old, next);
    expect(stats.chars.added).toBe(6); // " World"
    expect(stats.chars.removed).toBe(0);
  });

  it('counts removed characters', () => {
    const old = makeDoc([makeParagraph('Hello World')]);
    const next = makeDoc([makeParagraph('Hello')]);
    const stats = computeDeltaStats(old, next);
    expect(stats.chars.added).toBe(0);
    expect(stats.chars.removed).toBe(6); // " World"
  });

  it('counts modified text', () => {
    const old = makeDoc([makeParagraph('Hello')]);
    const next = makeDoc([makeParagraph('Hallo')]);
    const stats = computeDeltaStats(old, next);
    expect(stats.chars.added).toBe(1); // "a"
    expect(stats.chars.removed).toBe(1); // "e"
  });

  it('counts added lines', () => {
    const old = makeDoc([makeParagraph('Line 1')]);
    const next = makeDoc([makeParagraph('Line 1'), makeParagraph('Line 2')]);
    const stats = computeDeltaStats(old, next);
    expect(stats.lines.added).toBe(1);
    expect(stats.lines.removed).toBe(0);
  });

  it('counts removed lines', () => {
    const old = makeDoc([makeParagraph('Line 1'), makeParagraph('Line 2')]);
    const next = makeDoc([makeParagraph('Line 1')]);
    const stats = computeDeltaStats(old, next);
    expect(stats.lines.added).toBe(0);
    expect(stats.lines.removed).toBe(1);
  });

  it('counts words correctly', () => {
    const old = makeDoc([makeParagraph('Hello')]);
    const next = makeDoc([makeParagraph('Hello World')]);
    const stats = computeDeltaStats(old, next);
    expect(stats.words.added).toBe(1); // "World"
    expect(stats.words.removed).toBe(0);
  });

  it('counts CJK characters as individual words', () => {
    const old = makeDoc([makeParagraph('')]);
    const next = makeDoc([makeParagraph('Hello 世界')]);
    const stats = computeDeltaStats(old, next);
    expect(stats.words.added).toBe(3); // "Hello" + "世" + "界"
    expect(stats.chars.added).toBe(8); // "Hello 世界"
  });

  it('handles empty documents', () => {
    const old = makeDoc([]);
    const next = makeDoc([makeParagraph('Hello')]);
    const stats = computeDeltaStats(old, next);
    expect(stats.chars.added).toBe(5);
    expect(stats.lines.added).toBe(1);
  });
});

describe('formatDeltaStats', () => {
  it('formats added changes', () => {
    const formatted = formatDeltaStats({
      chars: { added: 100, removed: 0 },
      words: { added: 20, removed: 0 },
      lines: { added: 5, removed: 0 },
    });
    expect(formatted).toBe('+5 lines, +20 words, +100 chars');
  });

  it('formats removed changes', () => {
    const formatted = formatDeltaStats({
      chars: { added: 0, removed: 50 },
      words: { added: 0, removed: 10 },
      lines: { added: 0, removed: 2 },
    });
    expect(formatted).toBe('-2 lines, -10 words, -50 chars');
  });

  it('formats mixed changes', () => {
    const formatted = formatDeltaStats({
      chars: { added: 100, removed: 50 },
      words: { added: 20, removed: 10 },
      lines: { added: 5, removed: 2 },
    });
    expect(formatted).toBe('+5/-2 lines, +20/-10 words, +100/-50 chars');
  });

  it('returns "No changes" for zero stats', () => {
    const formatted = formatDeltaStats({
      chars: { added: 0, removed: 0 },
      words: { added: 0, removed: 0 },
      lines: { added: 0, removed: 0 },
    });
    expect(formatted).toBe('No changes');
  });

  it('formats large numbers with locale separators', () => {
    const formatted = formatDeltaStats({
      chars: { added: 12345, removed: 0 },
      words: { added: 2122, removed: 0 },
      lines: { added: 91, removed: 0 },
    });
    // The exact format depends on locale, but should contain the numbers
    expect(formatted).toContain('91');
    expect(formatted).toContain('lines');
    expect(formatted).toContain('words');
    expect(formatted).toContain('chars');
  });
});
