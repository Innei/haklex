import { SANS_FONT_STACK } from '../scene/fonts';
import type { ExcalidrawElement } from '../scene/types';
import { fontSizeOf } from './measure';
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

export const richTextFont = (node: RichNode): string => {
  const { fontSize, fontWeight } = blockTypography(node);
  return `${fontWeight === 600 ? 'bold ' : ''}${fontSize}px ${SANS_FONT_STACK}`;
};

function blockHeight(node: RichNode, width: number): number {
  const { lineHeight } = blockTypography(node);
  const font = richTextFont(node);
  const lines = wrapText(richTextPlainText(node), font, Math.max(1, width)).split('\n').length;
  return lines * fontSizeOf(font) * lineHeight;
}

function childIndent(node: RichNode): number {
  if (node.type === 'list') return RICHTEXT_LIST_INDENT;
  if (node.type === 'quote') return RICHTEXT_QUOTE_INDENT;
  return 0;
}

function hasBlockChildren(node: RichNode): boolean {
  return (node.children ?? []).some(
    (child) => isBlockContainer(child) || child.type === 'paragraph' || child.type === 'heading',
  );
}

function stackHeight(nodes: readonly RichNode[], width: number): number {
  let total = 0;
  for (const node of nodes) {
    if (isBlockContainer(node) && hasBlockChildren(node)) {
      total += stackHeight(node.children ?? [], width - childIndent(node));
    } else {
      total += blockHeight(node, width - childIndent(node));
    }
  }
  return total;
}

const cache = new WeakMap<object, Map<number, number>>();

export function measureRichTextHeight(content: unknown, width: number): number {
  const root = contentRoot(content);
  const byWidth = cache.get(root);
  const cached = byWidth?.get(width);
  if (cached !== undefined) return cached;
  const inner = width - RICHTEXT_PADDING * 2;
  const blocks = root.children ?? [];
  const body =
    blocks.length === 0 ? blockHeight({ type: 'paragraph' }, inner) : stackHeight(blocks, inner);
  const height = body + RICHTEXT_PADDING * 2;
  if (byWidth) byWidth.set(width, height);
  else cache.set(root, new Map([[width, height]]));
  return height;
}

export function resolveRichTextHeights<T extends ExcalidrawElement>(elements: readonly T[]): T[] {
  let changed = false;
  const next = elements.map((el) => {
    if (el.type !== 'richtext' || el.isDeleted) return el;
    const needed = measureRichTextHeight((el as { content?: unknown }).content, el.width);
    if (!(needed > el.height)) return el;
    changed = true;
    return { ...el, height: needed };
  });
  return changed ? next : (elements as T[]);
}
