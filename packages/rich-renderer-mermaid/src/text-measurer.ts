/*!
MIT License

Copyright (c) 2026 kepano

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import type { TextMeasurer } from 'pele';

/* eslint-disable unicorn/number-literal-case -- Prettier uses lowercase code point ranges. */

// Pele uses Canvas in browsers; the same width table on both sides keeps hydration deterministic.
// Arial advances from Pele 1.6.0, in thousandths of an em, packed as base-36 pairs.
const REGULAR =
  '7q7q9vfgfgopij5b9999atg87q997q7qfgfgfgfgfgfgfgfgfgfg7q7qg8g8g8fgs7ijijk2k2ijgzlmk27qdwijfgn5k2lmijlmk2ijgzk2ijq8ijijgz7q7q7qd1fg99fgfgdwfgfg7qfgfg6666dw66n5fgfgfgfg99dw7qfgdwk2dwdwdw9a789ag8';
const BOLD =
  '7q99d6fgfgopk26m9999atg87q997q7qfgfgfgfgfgfgfgfgfgfg9999g8g8g8gzr3k2k2k2k2ijgzlmk27qfgk2gzn5k2lmijlmk2ijgzk2ijq8ijijgz997q99g8fg99fggzfggzfg99gzgz7q7qfg7qopgzgzgzgzatfg99gzfglmfgfgdwat7satg8';

const enum Style {
  Bold = 1,
  Mono = 4,
}

function unpack(packed: string): Uint16Array {
  const out = new Uint16Array(95);
  for (let i = 0; i < 95; i++) out[i] = parseInt(packed.slice(i * 2, i * 2 + 2), 36);
  return out;
}

let regular: Uint16Array | undefined;
let bold: Uint16Array | undefined;

function isWide(c: number): boolean {
  return (
    (c >= 0x1100 && c <= 0x115f) ||
    (c >= 0x2e80 && c <= 0xa4cf) ||
    (c >= 0xac00 && c <= 0xd7a3) ||
    (c >= 0xf900 && c <= 0xfaff) ||
    (c >= 0xfe30 && c <= 0xfe4f) ||
    (c >= 0xff00 && c <= 0xff60) ||
    (c >= 0xffe0 && c <= 0xffe6) ||
    (c >= 0xd800 && c <= 0xdbff)
  );
}

function isZeroWidth(c: number): boolean {
  return (
    (c >= 0x300 && c <= 0x36f) ||
    (c >= 0x200b && c <= 0x200f) ||
    (c >= 0xdc00 && c <= 0xdfff) ||
    (c >= 0xfe00 && c <= 0xfe0f) ||
    c === 0xfeff
  );
}

// Estimates widths from a table of Arial advances. Used where no canvas is available.
export const textMeasurer: TextMeasurer = {
  width(text, size, style) {
    const mono = (style & Style.Mono) !== 0;
    const table = style & Style.Bold ? (bold ??= unpack(BOLD)) : (regular ??= unpack(REGULAR));
    let units = 0;
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c < 32) continue;
      if (c < 127) units += mono ? 600 : table[c - 32];
      else if (isZeroWidth(c)) continue;
      else if (isWide(c)) units += mono ? 1200 : 1000;
      else units += mono ? 600 : 580;
    }
    return (units * size) / 1000;
  },
};
