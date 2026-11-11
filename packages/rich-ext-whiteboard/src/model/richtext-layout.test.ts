import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { newRichTextElement } from './create';
import { setTextMeasurer } from './measure';
import { paragraphs } from './richtext';
import { measureRichTextHeight, resolveRichTextHeights } from './richtext-layout';

beforeEach(() =>
  setTextMeasurer((text, font) => text.length * (Number(/(\d+)px/.exec(font)![1]) / 2)),
);
afterEach(() => setTextMeasurer(null));

describe('rich text measurement', () => {
  it('stacks one line per short paragraph inside the padding', () => {
    const two = measureRichTextHeight(paragraphs(['Brew', 'Mila']), 160);
    const three = measureRichTextHeight(paragraphs(['Brew', 'Mila', 'Dan']), 160);
    expect(three - two).toBe(24);
    expect(two).toBe(12 * 2 + 24 * 2);
  });

  it('wraps a long paragraph to the card width', () => {
    const narrow = measureRichTextHeight(paragraphs(['word '.repeat(20)]), 120);
    const wide = measureRichTextHeight(paragraphs(['word '.repeat(20)]), 600);
    expect(narrow).toBeGreaterThan(wide);
  });

  it('counts an empty card as one line', () => {
    expect(measureRichTextHeight(undefined, 160)).toBe(12 * 2 + 24);
  });
});

describe('resolving card heights', () => {
  it('raises a card shorter than its content and keeps a taller one', () => {
    const short = newRichTextElement({
      id: 'a',
      width: 160,
      height: 20,
      content: paragraphs(['a', 'b', 'c']),
    });
    const tall = newRichTextElement({
      id: 'b',
      width: 160,
      height: 300,
      content: paragraphs(['a']),
    });
    const [a, b] = resolveRichTextHeights([short, tall]);
    expect(a.height).toBe(12 * 2 + 24 * 3);
    expect(b).toBe(tall);
  });

  it('returns the same array when nothing changes', () => {
    const tall = newRichTextElement({ width: 160, height: 300, content: paragraphs(['a']) });
    const list = [tall];
    expect(resolveRichTextHeights(list)).toBe(list);
  });
});
