export interface RGBA {
  a: number;
  b: number;
  g: number;
  r: number;
}

export interface HSVA {
  a: number;
  h: number;
  s: number;
  v: number;
}

export const clamp = (n: number, min: number, max: number): number =>
  n < min ? min : n > max ? max : n;

const to255 = (n: number): number => Math.round(clamp(n, 0, 1) * 255);

const pad2 = (n: number): string => n.toString(16).padStart(2, '0');

export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const hh = (((h % 360) + 360) % 360) / 60;
  const ss = clamp(s, 0, 1);
  const vv = clamp(v, 0, 1);
  const c = vv * ss;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = vv - c;

  let r: number;
  let g: number;
  let b: number;
  if (hh < 1) [r, g, b] = [c, x, 0];
  else if (hh < 2) [r, g, b] = [x, c, 0];
  else if (hh < 3) [r, g, b] = [0, c, x];
  else if (hh < 4) [r, g, b] = [0, x, c];
  else if (hh < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return { r: r + m, g: g + m, b: b + m };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, v };
}

export function hsvaToHex(hsva: HSVA): string {
  const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
  const hex = `#${pad2(to255(r))}${pad2(to255(g))}${pad2(to255(b))}`;
  return hsva.a < 1 ? `${hex}${pad2(to255(hsva.a))}` : hex;
}

export function hsvaToCss(hsva: HSVA): string {
  const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
  return hsva.a < 1
    ? `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${Number(hsva.a.toFixed(3))})`
    : `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`;
}

export function parseHex(input: string): RGBA | null {
  let s = input.trim().replace(/^#/, '');
  if (!/^[\da-f]+$/i.test(s)) return null;

  if (s.length === 3 || s.length === 4) {
    s = s
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (s.length !== 6 && s.length !== 8) return null;

  const r = Number.parseInt(s.slice(0, 2), 16) / 255;
  const g = Number.parseInt(s.slice(2, 4), 16) / 255;
  const b = Number.parseInt(s.slice(4, 6), 16) / 255;
  const a = s.length === 8 ? Number.parseInt(s.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

export function hexToHsva(input: string): HSVA | null {
  const rgba = parseHex(input);
  if (!rgba) return null;
  const { h, s, v } = rgbToHsv(rgba.r, rgba.g, rgba.b);
  return { h, s, v, a: rgba.a };
}

export function huePreviewHex(h: number): string {
  return hsvaToHex({ h, s: 1, v: 1, a: 1 });
}
