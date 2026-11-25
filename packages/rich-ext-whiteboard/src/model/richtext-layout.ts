import { fontFamilyToCss } from '../scene/fonts';
import type { ExcalidrawElement, FontFamilyId } from '../scene/types';
import { newRichTextElement, newSvgElement } from './create';
import { fontSizeOf } from './measure';
import { normalizeElement } from './restore';
import type { RichNode } from './richtext';
import {
  blockTypography,
  contentRoot,
  isBlockContainer,
  RICHTEXT_LIST_INDENT,
  RICHTEXT_PADDING,
  RICHTEXT_QUOTE_INDENT,
  richTextPlainText,
} from './richtext';
import { wrapText } from './text-layout';

export const richTextFont = (node: RichNode, fontFamily?: FontFamilyId): string => {
  const { fontSize, fontWeight } = blockTypography(node);
  return `${fontWeight === 600 ? 'bold ' : ''}${fontSize}px ${fontFamilyToCss(fontFamily)}`;
};

function blockHeight(node: RichNode, width: number, fontFamily?: FontFamilyId): number {
  const { lineHeight } = blockTypography(node);
  const font = richTextFont(node, fontFamily);
  const lines = wrapText(richTextPlainText(node), font, Math.max(1, width)).split('\n').length;
  return lines * fontSizeOf(font) * lineHeight;
}

export function childIndent(node: RichNode): number {
  if (node.type === 'list') return RICHTEXT_LIST_INDENT;
  if (node.type === 'quote') return RICHTEXT_QUOTE_INDENT;
  return 0;
}

export function hasBlockChildren(node: RichNode): boolean {
  return (node.children ?? []).some(
    (child) => isBlockContainer(child) || child.type === 'paragraph' || child.type === 'heading',
  );
}

function stackHeight(nodes: readonly RichNode[], width: number, fontFamily?: FontFamilyId): number {
  let total = 0;
  for (const node of nodes) {
    if (isBlockContainer(node) && hasBlockChildren(node)) {
      total += stackHeight(node.children ?? [], width - childIndent(node), fontFamily);
    } else {
      total += blockHeight(node, width - childIndent(node), fontFamily);
    }
  }
  return total;
}

const cache = new WeakMap<object, Map<string, number>>();

export function measureRichTextHeight(
  content: unknown,
  width: number,
  fontFamily?: FontFamilyId,
): number {
  const root = contentRoot(content);
  const key = `${width}:${fontFamily ?? ''}`;
  const byKey = cache.get(root);
  const cached = byKey?.get(key);
  if (cached !== undefined) return cached;
  const inner = width - RICHTEXT_PADDING * 2;
  const blocks = root.children ?? [];
  const body =
    blocks.length === 0
      ? blockHeight({ type: 'paragraph' }, inner, fontFamily)
      : stackHeight(blocks, inner, fontFamily);
  const height = body + RICHTEXT_PADDING * 2;
  if (byKey) byKey.set(key, height);
  else cache.set(root, new Map([[key, height]]));
  return height;
}

const DEFAULT_KEYS: Partial<Record<string, string[]>> = {
  richtext: Object.keys(newRichTextElement({})),
  svg: Object.keys(newSvgElement({})),
};

function withDefaults<T extends ExcalidrawElement>(el: T): T {
  const keys = DEFAULT_KEYS[el.type];
  const incomplete =
    !!keys &&
    (keys.some(
      (key) => !(key in el) || (el as unknown as Record<string, unknown>)[key] === undefined,
    ) ||
      !Number.isFinite(el.width) ||
      !Number.isFinite(el.height));
  if (!incomplete) return el;
  const next = normalizeElement(el);
  return {
    ...next,
    width: Number.isFinite(next.width) ? next.width : 0,
    height: Number.isFinite(next.height) ? next.height : 0,
  };
}

export function resolveRichTextHeights<T extends ExcalidrawElement>(elements: readonly T[]): T[] {
  let changed = false;
  const next = elements.map((input) => {
    const el = withDefaults(input);
    if (el !== input) changed = true;
    if (el.type !== 'richtext' || el.isDeleted) return el;
    const needed = measureRichTextHeight(
      (el as { content?: unknown }).content,
      el.width,
      (el as { fontFamily?: FontFamilyId }).fontFamily,
    );
    if (!(needed > el.height)) return el;
    changed = true;
    return { ...el, height: needed };
  });
  return changed ? next : (elements as T[]);
}
