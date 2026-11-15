import { fontFamilyToCss, HAND_FONT_STACK } from '../scene/fonts';
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

const familyName = (value: string) => value.trim().replaceAll(/^["']|["']$/g, '');
const HAND_WEB_FAMILIES = new Set(HAND_FONT_STACK.split(',').slice(0, 4).map(familyName));

function hasRegisteredHandFace(stack: string): boolean {
  const wanted = stack
    .split(',')
    .map(familyName)
    .filter((family) => HAND_WEB_FAMILIES.has(family));
  if (wanted.length === 0) return true;
  try {
    for (const face of document.fonts) if (wanted.includes(familyName(face.family))) return true;
  } catch {
    return false;
  }
  return false;
}

async function loadFonts(elements: readonly ExcalidrawElement[], strict: boolean): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return;
  const samples = new Map<string, { chars: Set<string>; stack: string }>();
  for (const el of elements) {
    if (el.type !== 'text' || el.isDeleted) continue;
    const stack = fontFamilyToCss(el.fontFamily);
    const font = `${el.fontSize}px ${stack}`;
    const sample = samples.get(font) ?? { chars: new Set<string>(), stack };
    for (const ch of el.originalText ?? el.text) sample.chars.add(ch);
    samples.set(font, sample);
  }
  await Promise.all(
    [...samples].map(async ([font, { chars, stack }]) => {
      const faces = await document.fonts.load(font, [...chars].join('')).catch(() => {
        if (strict) throw new FontLoadError(font);
        return [];
      });
      // fonts.load resolves with nothing, not an error, when no @font-face names the family.
      if (strict && faces.length === 0 && !hasRegisteredHandFace(stack)) {
        throw new FontLoadError(font);
      }
    }),
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
