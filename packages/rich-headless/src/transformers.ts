/**
 * Headless Markdown transformers — export-only (Lexical → Markdown).
 * Import stubs are no-ops; used only for $convertToMarkdownString.
 */

import {
  $convertToMarkdownString,
  CHECK_LIST,
  type ElementTransformer,
  type TextFormatTransformer,
  type TextMatchTransformer,
  TRANSFORMERS,
} from '@lexical/markdown';
import { $isTableCellNode, $isTableNode, $isTableRowNode } from '@lexical/table';

// ── Helpers ──

// eslint-disable-next-line regexp/no-useless-assertions -- intentionally never-matching regex for export-only transformers
const NEVER = /a^/;
const NOOP = () => {};

function qA(v: string): string {
  return v.replaceAll('"', '\\"');
}

function escHtml(v: string): string {
  return v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function escCell(v: string): string {
  return v.replaceAll('|', '\\|').replaceAll('\n', '<br/>');
}

function fence(content: string): string {
  const m = content.match(/`+/g);
  const max = m?.reduce((a, r) => Math.max(a, r.length), 0) ?? 0;
  return '`'.repeat(Math.max(3, max + 1));
}

function walkText(node: Record<string, unknown>): string {
  const children = node.children as Record<string, unknown>[] | undefined;
  if (!children) return (node.text as string) ?? '';
  return children.map(walkText).join('\n');
}

function stateText(state: unknown): string {
  if (!state || typeof state !== 'object') return '';
  const root = (state as Record<string, unknown>).root as Record<string, unknown> | undefined;
  return root ? walkText(root) : '';
}

// ── TextMatch (inline) ──

export const SPOILER_TRANSFORMER: TextMatchTransformer = {
  dependencies: [],
  export: (node) => (node.getType() === 'spoiler' ? `||${node.getTextContent()}||` : null),
  importRegExp: /\|\|(.+?)\|\|/,
  regExp: /\|\|(.+?)\|\|$/,
  replace: NOOP as any,
  trigger: '|',
  type: 'text-match',
};

export const MENTION_TRANSFORMER: TextMatchTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'mention') return null;
    const j = node.exportJSON() as any;
    const base = `{${j.platform}@${j.handle}}`;
    return j.displayName ? `[${j.displayName}]${base}` : base;
  },
  importRegExp: /(?:\[([^\]]+)\])?\{(\w+)@(\w[\w.-]*)\}/,
  regExp: /(?:\[([^\]]+)\])?\{(\w+)@(\w[\w.-]*)\}$/,
  replace: NOOP as any,
  trigger: '}',
  type: 'text-match',
};

export const FOOTNOTE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [],
  export: (node) =>
    node.getType() === 'footnote' ? `[^${(node as any).__identifier ?? ''}]` : null,
  importRegExp: /\[\^(\w+)\]/,
  regExp: /\[\^(\w+)\]$/,
  replace: NOOP as any,
  trigger: ']',
  type: 'text-match',
};

export const KATEX_INLINE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [],
  export: (node) =>
    node.getType() === 'katex-inline' ? `$${(node as any).__equation ?? ''}$` : null,
  importRegExp: /\$([^\n$]+)\$/,
  regExp: /\$([^\n$]+)\$$/,
  replace: NOOP as any,
  trigger: '$',
  type: 'text-match',
};

export const RUBY_TRANSFORMER: TextMatchTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'ruby') return null;
    const base = escHtml(node.getTextContent());
    const reading = escHtml((node as any).__reading ?? '');
    if (!reading) return base;
    return `<ruby>${base}<rt>${reading}</rt></ruby>`;
  },
  importRegExp: /<ruby>([^<]*)<rt>([^<]*)<\/rt>(?:<rp>[^<]*<\/rp>)*<\/ruby>/i,
  regExp: /<ruby>([^<]*)<rt>([^<]*)<\/rt>(?:<rp>[^<]*<\/rp>)*<\/ruby>$/i,
  replace: NOOP as any,
  trigger: '>',
  type: 'text-match',
};

// ── TextFormat ──

export const INSERT_TRANSFORMER: TextFormatTransformer = {
  format: ['underline'],
  tag: '++',
  type: 'text-format',
};

export const SUPERSCRIPT_TRANSFORMER: TextFormatTransformer = {
  format: ['superscript'],
  tag: '^',
  type: 'text-format',
};

export const SUBSCRIPT_TRANSFORMER: TextFormatTransformer = {
  format: ['subscript'],
  tag: '~',
  type: 'text-format',
};

// ── Element (block) ──

export const FOOTNOTE_SECTION_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'footnote-section') return null;
    const defs = (node as any).__definitions ?? {};
    return Object.entries(defs)
      .map(([id, content]) => `[^${id}]: ${content}`)
      .join('\n');
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const CONTAINER_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    const t = node.getType();
    if (t === 'banner') {
      const type = (node as any).__bannerType ?? 'note';
      return `::: ${type}\n${node.getTextContent()}\n:::`;
    }
    if (t === 'details') {
      const summary = (node as any).__summary ?? '';
      return `::: details{summary="${qA(summary)}"}\n${node.getTextContent()}\n:::`;
    }
    return null;
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

const ALERT_KEY: Record<string, string> = {
  note: 'NOTE',
  tip: 'TIP',
  important: 'IMPORTANT',
  warning: 'WARNING',
  caution: 'CAUTION',
};

export const GIT_ALERT_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'alert-quote') return null;
    const key = ALERT_KEY[(node as any).__alertType ?? 'note'] ?? 'NOTE';
    const lines = node.getTextContent().split('\n');
    return [`> [!${key}]`, ...lines.map((l) => `> ${l}`)].join('\n');
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const KATEX_BLOCK_TRANSFORMER: TextMatchTransformer = {
  dependencies: [],
  export: (node) =>
    node.getType() === 'katex-block' ? `$$${(node as any).__equation ?? ''}$$` : null,
  importRegExp: /\$\$([^$]+)\$\$/,
  regExp: /\$\$([^$]+)\$\$$/,
  replace: NOOP as any,
  trigger: '$',
  type: 'text-match',
};

export const IMAGE_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'image') return null;
    const j = node.exportJSON() as any;
    const title = j.caption ? ` "${qA(j.caption)}"` : '';
    return `![${j.altText || ''}](${j.src}${title})`;
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const VIDEO_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'video') return null;
    const j = node.exportJSON() as any;
    const attrs = [`src="${qA(j.src)}"`];
    if (j.poster) attrs.push(`poster="${qA(j.poster)}"`);
    if (j.width) attrs.push(`width=${j.width}`);
    if (j.height) attrs.push(`height=${j.height}`);
    return `<video ${attrs.join(' ')} controls></video>`;
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const CODE_BLOCK_NODE_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'code-block') return null;
    const j = node.exportJSON() as any;
    const f = fence(j.code || '');
    return `${f}${j.language || ''}\n${j.code || ''}\n${f}`;
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const LINK_CARD_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'link-card') return null;
    const j = node.exportJSON() as any;
    return j.title ? `[${j.title}](${j.url})` : `<${j.url}>`;
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const MERMAID_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'mermaid') return null;
    const d = (node as any).__diagram ?? '';
    const f = fence(d);
    return `${f}mermaid\n${d}\n${f}`;
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const NESTED_DOC_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'nested-doc') return null;
    return `<nested-doc>\n${stateText((node as any).__contentState)}\n</nested-doc>`;
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const GRID_CONTAINER_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'grid-container') return null;
    const j = node.exportJSON() as any;
    const cells = (j.cells ?? []).map((c: unknown) => `::: cell\n${stateText(c)}\n:::`).join('\n');
    return `::: grid{cols=${j.cols ?? 2} gap="${qA(String(j.gap ?? '16px'))}"}\n${cells}\n:::`;
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const HORIZONTAL_RULE_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => (node.getType() === 'horizontalrule' ? '---' : null),
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const TABLE_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (!$isTableNode(node)) return null;
    const rows = node.getChildren().filter($isTableRowNode);
    if (rows.length === 0) return '|  |\n| --- |';
    const data = rows.map((row) =>
      row
        .getChildren()
        .filter($isTableCellNode)
        .map((c) => escCell(c.getTextContent())),
    );
    const hdr = data[0];
    const sep = hdr.map(() => '---');
    return [
      `| ${hdr.join(' | ')} |`,
      `| ${sep.join(' | ')} |`,
      ...data.slice(1).map((r) => `| ${r.join(' | ')} |`),
    ].join('\n');
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

// ── Extension block transformers ──

export const CODE_SNIPPET_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'code-snippet') return null;
    const j = node.exportJSON() as any;
    const body = (j.files ?? [])
      .map((f: any) => {
        const fc = fence(f.code || '');
        return [
          `::: file{name="${qA(f.filename || 'untitled')}" lang="${qA(f.language || '')}"}`,
          `${fc}${f.language || ''}`,
          f.code || '',
          fc,
          ':::',
        ].join('\n');
      })
      .join('\n');
    return `::: code-snippet\n${body}\n:::`;
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const EMBED_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => (node.getType() === 'embed' ? `<${(node as any).__url || ''}>` : null),
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const GALLERY_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) => {
    if (node.getType() !== 'gallery') return null;
    const imgs = (node.exportJSON() as any).images ?? [];
    return imgs.map((i: any) => `![${i.alt || ''}](${i.src || ''})`).join('\n');
  },
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

export const EXCALIDRAW_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node) =>
    node.getType() === 'excalidraw'
      ? `<excalidraw>\n${(node as any).__snapshot || ''}\n</excalidraw>`
      : null,
  regExp: NEVER,
  replace: NOOP,
  type: 'element',
};

// ── Aggregate ──

export const allHeadlessTransformers = [
  // Inline
  SPOILER_TRANSFORMER,
  MENTION_TRANSFORMER,
  FOOTNOTE_TRANSFORMER,
  INSERT_TRANSFORMER,
  SUPERSCRIPT_TRANSFORMER,
  SUBSCRIPT_TRANSFORMER,
  RUBY_TRANSFORMER,
  KATEX_INLINE_TRANSFORMER,
  // Block (specific first)
  FOOTNOTE_SECTION_TRANSFORMER,
  CONTAINER_TRANSFORMER,
  GIT_ALERT_TRANSFORMER,
  CHECK_LIST,
  KATEX_BLOCK_TRANSFORMER,
  IMAGE_BLOCK_TRANSFORMER,
  VIDEO_BLOCK_TRANSFORMER,
  CODE_BLOCK_NODE_TRANSFORMER,
  LINK_CARD_BLOCK_TRANSFORMER,
  MERMAID_BLOCK_TRANSFORMER,
  NESTED_DOC_BLOCK_TRANSFORMER,
  GRID_CONTAINER_BLOCK_TRANSFORMER,
  HORIZONTAL_RULE_BLOCK_TRANSFORMER,
  TABLE_BLOCK_TRANSFORMER,
  CODE_SNIPPET_BLOCK_TRANSFORMER,
  EMBED_BLOCK_TRANSFORMER,
  GALLERY_BLOCK_TRANSFORMER,
  EXCALIDRAW_BLOCK_TRANSFORMER,
  // Standard (heading, quote, list, code, bold, italic, strikethrough, link…)
  ...TRANSFORMERS,
];

/** Call inside editor.read() to convert current state to Markdown. */
export function $toMarkdown(): string {
  return $convertToMarkdownString(allHeadlessTransformers);
}
