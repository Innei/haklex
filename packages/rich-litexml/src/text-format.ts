import type { XmlContent, XmlElement } from './types';

/** Lexical text format bitmask values */
export const FORMAT_BITS = {
  bold: 1,
  italic: 2,
  strikethrough: 4,
  underline: 8,
  code: 16,
  subscript: 32,
  superscript: 64,
  highlight: 128,
} as const;

/** Ordered list: bit value → XML tag. Order determines nesting (outer→inner). */
const FORMAT_BIT_TO_TAG: [number, string][] = [
  [1, 'b'],
  [2, 'i'],
  [4, 's'],
  [8, 'u'],
  [16, 'code'],
  [32, 'sub'],
  [64, 'sup'],
  [128, 'mark'],
];

/** Reverse map: XML tag name → bit value (includes aliases) */
export const FORMAT_TAG_TO_BIT: Record<string, number> = {
  b: 1,
  strong: 1,
  i: 2,
  em: 2,
  s: 4,
  del: 4,
  strike: 4,
  u: 8,
  code: 16,
  sub: 32,
  sup: 64,
  mark: 128,
};

/** Wrap text content with nested format tags based on bitmask. */
export function wrapWithFormatTags(text: string, format: number): XmlContent[] {
  if (format === 0) return [text];

  let content: XmlContent[] = [text];

  // Wrap inside-out: last matching bit wraps first (innermost), first bit wraps last (outermost)
  for (let idx = FORMAT_BIT_TO_TAG.length - 1; idx >= 0; idx--) {
    const [bit, tag] = FORMAT_BIT_TO_TAG[idx];
    if (format & bit) {
      content = [{ tag, children: content } as XmlElement];
    }
  }
  return content;
}

/** Check if a tag name is a known text format tag. */
export function isFormatTag(tagName: string): boolean {
  return tagName.toLowerCase() in FORMAT_TAG_TO_BIT;
}

/** Get the format bit for a tag name. Returns 0 if not a format tag. */
export function getFormatBit(tagName: string): number {
  return FORMAT_TAG_TO_BIT[tagName.toLowerCase()] ?? 0;
}
