import { fontFamilyToCss } from '../scene/fonts';
import type { FontFamilyId } from '../scene/types';

export type TextMeasurer = (text: string, font: string) => number;

const CJK =
  /[\p{Script=Han}\p{Script=Hangul}\p{Script=Hiragana}\p{Script=Katakana}\u3000-\u303F\uFF01-\uFF60]/u;

function estimate(text: string, font: string): number {
  const size = fontSizeOf(font);
  let width = 0;
  for (const ch of text) width += CJK.test(ch) ? size : size * 0.6;
  return width;
}

type Context2D = { font: string; measureText: (text: string) => { width: number } };

let context: Context2D | null | undefined;

function getContext(): Context2D | null {
  if (context !== undefined) return context;
  context = null;
  if (typeof OffscreenCanvas !== 'undefined') {
    context = new OffscreenCanvas(1, 1).getContext('2d') as Context2D | null;
  }
  if (!context && typeof document !== 'undefined' && !/jsdom/i.test(navigator.userAgent)) {
    context = document.createElement('canvas').getContext('2d');
  }
  return context;
}

const canvasMeasurer: TextMeasurer = (text, font) => {
  const ctx = getContext();
  if (!ctx) return estimate(text, font);
  ctx.font = font;
  return ctx.measureText(text).width;
};

let measurer: TextMeasurer = canvasMeasurer;

export function setTextMeasurer(fn: TextMeasurer | null): void {
  measurer = fn ?? canvasMeasurer;
}

export function measureLine(text: string, font: string): number {
  return measurer(text, font);
}

export function fontSizeOf(font: string): number {
  const match = /(\d+(?:\.\d+)?)px/.exec(font);
  return match ? Number(match[1]) : 20;
}

export function getFontString({
  fontSize,
  fontFamily,
}: {
  fontFamily: FontFamilyId | number;
  fontSize: number;
}): string {
  return `${fontSize}px ${fontFamilyToCss(fontFamily)}`;
}

const LINE_HEIGHTS: Record<number, number> = {
  1: 1.25,
  2: 1.15,
  3: 1.2,
  5: 1.25,
  6: 1.35,
  8: 1.15,
  9: 1.15,
};

export function getLineHeight(fontFamily: FontFamilyId | number): number {
  return LINE_HEIGHTS[fontFamily] ?? 1.25;
}

export function measureText(
  text: string,
  font: string,
  lineHeight: number,
): { height: number; width: number } {
  const lines = text.split('\n');
  const width = Math.max(0, ...lines.map((line) => measureLine(line, font)));
  return { width, height: lines.length * fontSizeOf(font) * lineHeight };
}

export function isCJK(ch: string): boolean {
  return CJK.test(ch);
}
