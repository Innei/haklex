export interface RichNode {
  [key: string]: unknown;
  children?: RichNode[];
  format?: number | string;
  listType?: string;
  style?: string;
  tag?: string;
  text?: string;
  type: string;
  url?: string;
}

export interface RichTextContent {
  root: RichNode;
}

export const RICHTEXT_PADDING = 12;
export const RICHTEXT_LIST_INDENT = 20;
export const RICHTEXT_QUOTE_INDENT = 12;
export const RICHTEXT_TEXT_COLOR = '#1e1e1e';

export interface BlockTypography {
  fontSize: number;
  fontWeight: 400 | 600;
  lineHeight: number;
}

const BODY: BlockTypography = { fontSize: 16, fontWeight: 400, lineHeight: 1.5 };

const HEADINGS: Record<string, BlockTypography> = {
  h1: { fontSize: 26, fontWeight: 600, lineHeight: 1.3 },
  h2: { fontSize: 22, fontWeight: 600, lineHeight: 1.35 },
  h3: { fontSize: 18, fontWeight: 600, lineHeight: 1.4 },
};

export function blockTypography(node: RichNode): BlockTypography {
  if (node.type !== 'heading') return BODY;
  return HEADINGS[node.tag ?? ''] ?? { ...BODY, fontWeight: 600 };
}

export const TEXT_FORMAT = {
  bold: 1,
  italic: 2,
  strikethrough: 4,
  underline: 8,
  code: 16,
  highlight: 128,
} as const;

export function hasFormat(node: RichNode, flag: number): boolean {
  return typeof node.format === 'number' && (node.format & flag) !== 0;
}

const BLOCK_CONTAINERS = new Set(['root', 'list', 'listitem', 'quote']);
export const BLOCK_TYPES = new Set(['paragraph', 'heading', 'quote', 'list', 'listitem']);
export const INLINE_TYPES = new Set(['text', 'linebreak', 'tab', 'link', 'autolink']);

export function isBlockContainer(node: RichNode): boolean {
  return BLOCK_CONTAINERS.has(node.type);
}

export function richTextPlainText(node: RichNode | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'linebreak') return '\n';
  if (node.type === 'tab') return '\t';
  return (node.children ?? []).map(richTextPlainText).join('');
}

export function contentRoot(content: unknown): RichNode {
  const root = (content as RichTextContent | undefined)?.root;
  return root && Array.isArray(root.children) ? root : { type: 'root', children: [] };
}

export function paragraphs(lines: readonly string[]): RichTextContent {
  return {
    root: {
      type: 'root',
      children: lines.map((text) => ({
        type: 'paragraph',
        children: text ? [{ type: 'text', text }] : [],
      })),
    },
  };
}
