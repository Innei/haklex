import { fontFamilyToCss } from '../scene/fonts';
import type { ExcalidrawElement, LinearElement, TextElement } from '../scene/types';
import {
  newElement,
  newFrameElement,
  newFreedrawElement,
  newImageElement,
  newLinearElement,
  newRichTextElement,
  newSvgElement,
  newTextElement,
} from './create';
import { syncIndices } from './fractional-index';
import { bumpVersion } from './mutate';
import { normalizeSvgSource } from './svg';
import { refreshTextDimensions } from './text-layout';

type Raw = Partial<ExcalidrawElement> & { id?: string; type?: string };

function defaultsFor(raw: Raw): ExcalidrawElement {
  switch (raw.type) {
    case 'line':
    case 'arrow': {
      return newLinearElement(raw.type, {});
    }
    case 'freedraw': {
      return newFreedrawElement({});
    }
    case 'text': {
      const text = (raw as Partial<TextElement>).text ?? '';
      return newTextElement({ text });
    }
    case 'image': {
      return newImageElement({});
    }
    case 'svg': {
      return newSvgElement({});
    }
    case 'richtext': {
      return newRichTextElement({});
    }
    case 'frame':
    case 'magicframe': {
      return { ...newFrameElement({}), type: raw.type } as ExcalidrawElement;
    }
    default: {
      return newElement((raw.type ?? 'rectangle') as 'rectangle', {});
    }
  }
}

const ADAPTIVE_RADIUS_TYPES = new Set(['rectangle', 'image', 'embeddable', 'iframe']);

function legacyRoundness(raw: Raw): { type: number } | null {
  if ((raw as { strokeSharpness?: string }).strokeSharpness !== 'round') return null;
  return { type: ADAPTIVE_RADIUS_TYPES.has(raw.type ?? '') ? 3 : 2 };
}

export function normalizeElement<T extends ExcalidrawElement>(raw: T): T {
  const defaults = defaultsFor(raw as Raw);
  const merged: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(raw)) {
    if (value !== undefined) merged[key] = value;
  }
  if (!('roundness' in raw) || raw.roundness === undefined) {
    merged.roundness = legacyRoundness(raw as Raw);
  }
  if ((raw as Raw).type === 'text' && merged.originalText === undefined) {
    merged.originalText = (raw as unknown as TextElement).text;
  }
  if ((raw as Raw).type === 'svg' && typeof merged.svg === 'string') {
    merged.svg = normalizeSvgSource(merged.svg);
  }
  if (
    ((raw as Raw).type === 'line' || (raw as Raw).type === 'arrow') &&
    !(raw as LinearElement).points
  ) {
    merged.points = [
      [0, 0],
      [raw.width ?? 0, raw.height ?? 0],
    ];
  }
  return merged as T;
}

export class FontLoadError extends Error {
  constructor(readonly font: string) {
    super(`Could not load ${font}`);
    this.name = 'FontLoadError';
  }
}

async function loadFonts(elements: readonly ExcalidrawElement[], strict: boolean): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  const samples = new Map<string, Set<string>>();
  for (const el of elements) {
    if (el.type !== 'text' || el.isDeleted) continue;
    const font = `${el.fontSize}px ${fontFamilyToCss(el.fontFamily)}`;
    const chars = samples.get(font) ?? new Set<string>();
    for (const ch of el.originalText ?? el.text) chars.add(ch);
    samples.set(font, chars);
  }
  await Promise.all(
    [...samples].map(([font, chars]) =>
      document.fonts.load(font, [...chars].join('')).catch(() => {
        if (strict) throw new FontLoadError(font);
        return [];
      }),
    ),
  );
}

function textChanged(a: TextElement, b: TextElement): boolean {
  return (
    a.text !== b.text || a.width !== b.width || a.height !== b.height || a.x !== b.x || a.y !== b.y
  );
}

export async function restoreElements(
  elements: readonly ExcalidrawElement[],
  _localElements: null,
  opts: { refreshDimensions?: boolean; strictFonts?: boolean } = {},
): Promise<ExcalidrawElement[]> {
  const normalized = syncIndices(elements.map((el) => normalizeElement(el)));
  if (!opts.refreshDimensions) return normalized;

  await loadFonts(normalized, opts.strictFonts ?? false);
  const byId = new Map(normalized.map((el) => [el.id, el]));
  return normalized.map((el) => {
    if (el.type !== 'text') return el;
    const container = el.containerId ? byId.get(el.containerId) : undefined;
    const next = refreshTextDimensions(el, container);
    return textChanged(el, next) ? bumpVersion(el, next) : el;
  });
}
