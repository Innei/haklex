import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { newElement, newLinearElement, newTextElement } from './create';
import { getFontString, getLineHeight, measureText, setTextMeasurer } from './measure';
import { restoreElements } from './restore';
import {
  BOUND_TEXT_PADDING,
  getContainerTextMaxWidth,
  getLinearMidpoint,
  layoutBoundText,
  refreshTextDimensions,
  wrapText,
} from './text-layout';

const CHAR = 10;

beforeEach(() => setTextMeasurer((text) => text.length * CHAR));
afterEach(() => setTextMeasurer(null));

describe('measure', () => {
  it('builds a css font string from size and family', () => {
    expect(getFontString({ fontSize: 20, fontFamily: 5 })).toMatch(/^20px "LXGW WenKai Screen"/);
  });

  it('uses Excalidraw line heights per family', () => {
    expect(getLineHeight(5)).toBe(1.25);
    expect(getLineHeight(2)).toBe(1.15);
    expect(getLineHeight(3)).toBe(1.2);
  });

  it('measures the widest line and stacks line heights', () => {
    const size = measureText('ab\nabcd', getFontString({ fontSize: 20, fontFamily: 5 }), 1.25);
    expect(size).toEqual({ width: 40, height: 50 });
  });
});

describe('wrapText', () => {
  const font = getFontString({ fontSize: 20, fontFamily: 5 });

  it('breaks on spaces to fit the width', () => {
    expect(wrapText('aaa bbb ccc', font, 75)).toBe('aaa bbb\nccc');
  });

  it('keeps explicit line breaks', () => {
    expect(wrapText('a\nb', font, 1000)).toBe('a\nb');
  });

  it('breaks CJK text between characters', () => {
    expect(wrapText('静态编辑拆分', font, 40)).toBe('静态编辑\n拆分');
  });

  it('splits a word longer than the line', () => {
    expect(wrapText('abcdefgh', font, 30)).toBe('abc\ndef\ngh');
  });
});

describe('bound text layout', () => {
  it('centres wrapped text inside a rectangle with padding', () => {
    const box = newElement('rectangle', { x: 0, y: 0, width: 100, height: 100 });
    const text = newTextElement({
      text: 'aaa bbb ccc',
      originalText: 'aaa bbb ccc',
      containerId: box.id,
      textAlign: 'center',
      verticalAlign: 'middle',
    });
    expect(getContainerTextMaxWidth(box)).toBe(100 - BOUND_TEXT_PADDING * 2);
    const { text: laid, container } = layoutBoundText(box, text);
    expect(laid.text).toBe('aaa bbb\nccc');
    expect(laid.width).toBe(70);
    expect(laid.height).toBe(50);
    expect(laid.x).toBe(15);
    expect(laid.y).toBe(25);
    expect(laid.textAlign).toBe('center');
    expect(laid.verticalAlign).toBe('middle');
    expect(container).toBe(box);
  });

  it('keeps the alignment of text inside a container', () => {
    const box = newElement('rectangle', { x: 0, y: 0, width: 200, height: 100 });
    const top = newTextElement({
      text: 'ab',
      originalText: 'ab',
      containerId: box.id,
      textAlign: 'left',
      verticalAlign: 'top',
    });
    const laid = layoutBoundText(box, top).text;
    expect(laid.textAlign).toBe('left');
    expect(laid.verticalAlign).toBe('top');
    expect(laid.x).toBe(BOUND_TEXT_PADDING);
    expect(laid.y).toBe(BOUND_TEXT_PADDING);
    const bottom = layoutBoundText(box, {
      ...top,
      textAlign: 'right',
      verticalAlign: 'bottom',
    }).text;
    expect(bottom.x + bottom.width).toBe(200 - BOUND_TEXT_PADDING);
    expect(bottom.y + bottom.height).toBe(100 - BOUND_TEXT_PADDING);
  });

  it('grows the container when the text is taller', () => {
    const box = newElement('rectangle', { x: 0, y: 0, width: 60, height: 20 });
    const text = newTextElement({
      text: 'aaaa bbbb',
      originalText: 'aaaa bbbb',
      containerId: box.id,
    });
    const { container } = layoutBoundText(box, text);
    expect(container.height).toBe(50 + BOUND_TEXT_PADDING * 2);
    expect(container.version).toBe((box.version ?? 0) + 1);
  });

  it('places arrow labels at the middle of the path', () => {
    const arrow = newLinearElement('arrow', {
      x: 0,
      y: 0,
      width: 200,
      height: 0,
      points: [
        [0, 0],
        [200, 0],
      ],
    });
    expect(getLinearMidpoint(arrow)).toEqual([100, 0]);
    const label = newTextElement({ text: 'go', originalText: 'go', containerId: arrow.id });
    const { text: laid } = layoutBoundText(arrow, label);
    expect(laid.x + laid.width / 2).toBe(100);
    expect(laid.y + laid.height / 2).toBe(0);
  });

  it('measures free text by its original text', () => {
    const text = newTextElement({ text: 'abc', originalText: 'abc', width: 1, height: 1 });
    const next = refreshTextDimensions(text);
    expect(next.width).toBe(30);
    expect(next.height).toBe(25);
  });
});

describe('restoreElements', () => {
  it('fills missing fields but keeps unknown keys', async () => {
    const raw = {
      id: 'r1',
      type: 'rectangle',
      x: 1,
      y: 2,
      width: 3,
      height: 4,
      strokeColor: '#e03131',
      customData: { keep: true },
      somethingNew: 42,
    };
    const [el] = (await restoreElements([raw as never], null)) as unknown as Array<
      Record<string, unknown>
    >;
    expect(el).toMatchObject({ id: 'r1', strokeColor: '#e03131', somethingNew: 42 });
    expect(el.customData).toEqual({ keep: true });
    expect(el.groupIds).toEqual([]);
    expect(el.boundElements).toBeNull();
    expect(typeof el.index).toBe('string');
    expect(typeof el.seed).toBe('number');
  });

  it('returns a promise', () => {
    expect(restoreElements([], null)).toBeInstanceOf(Promise);
  });

  it('recomputes text size only when asked and only bumps changed text', async () => {
    const changed = newTextElement({
      text: 'abcd',
      originalText: 'abcd',
      width: 1,
      height: 1,
      index: 'a0',
    });
    const same = newTextElement({
      text: 'ab',
      originalText: 'ab',
      width: 20,
      height: 25,
      index: 'a1',
    });
    const untouched = await restoreElements([changed, same], null);
    expect(untouched[0].width).toBe(1);

    const [a, b] = await restoreElements([changed, same], null, { refreshDimensions: true });
    expect(a.width).toBe(40);
    expect(a.version).toBe((changed.version ?? 0) + 1);
    expect(b).toEqual(same);
  });
});
