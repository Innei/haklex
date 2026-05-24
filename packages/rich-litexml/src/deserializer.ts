import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

import { parseHTML } from './parse-html';
import type { LitexmlRegistry } from './registry';
import { getFormatBit, isFormatTag } from './text-format';
import type { ReaderContext } from './types';

/**
 * HTML5 void elements — tags the HTML parser already treats as self-closing
 * regardless of `/>` syntax. Custom or non-void tags written as `<tag … />`
 * are otherwise interpreted as opening tags by the HTML parser, which then
 * swallows all following siblings as children until a matching close tag (or
 * end of document) is found. We expand those into explicit `<tag …></tag>`
 * before handing the string to linkedom / DOMParser.
 */
const HTML_VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const SELF_CLOSING_RE = /<([\w-]+)((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*\/>/g;

const CDATA_OPEN = '<![CDATA[';
const CDATA_CLOSE = ']]>';

function expandSelfClosing(chunk: string): string {
  return chunk.replaceAll(SELF_CLOSING_RE, (match, tag: string, attrs: string) => {
    if (HTML_VOID_ELEMENTS.has(tag.toLowerCase())) return match;
    return `<${tag}${attrs}></${tag}>`;
  });
}

/**
 * Expand `<custom-tag … />` to `<custom-tag …></custom-tag>` outside CDATA.
 * Leaves HTML void elements and already-paired tags untouched. CDATA content
 * is sliced out verbatim with `indexOf` to avoid regex pitfalls around `]]>`.
 */
function normalizeSelfClosingTags(xml: string): string {
  const out: string[] = [];
  let cursor = 0;
  while (cursor < xml.length) {
    const start = xml.indexOf(CDATA_OPEN, cursor);
    if (start < 0) {
      out.push(expandSelfClosing(xml.slice(cursor)));
      break;
    }
    out.push(expandSelfClosing(xml.slice(cursor, start)));
    const end = xml.indexOf(CDATA_CLOSE, start + CDATA_OPEN.length);
    if (end < 0) {
      // Unterminated CDATA — keep verbatim and stop processing.
      out.push(xml.slice(start));
      break;
    }
    out.push(xml.slice(start, end + CDATA_CLOSE.length));
    cursor = end + CDATA_CLOSE.length;
  }
  return out.join('');
}

function parseXml(xml: string): Document {
  return parseHTML(`<!DOCTYPE html><html><body>${normalizeSelfClosingTags(xml)}</body></html>`);
}

export function deserializeFromXml(xml: string, registry: LitexmlRegistry): SerializedEditorState {
  const doc = parseXml(xml);
  // Find the <doc> element inside body
  const docEl = doc.querySelector('doc') ?? doc.body;

  const ctx = createReaderContext(registry);
  const children = ctx.parseChildren(docEl as unknown as Element);

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  } as SerializedEditorState;
}

export function deserializeNodesFromXml(
  xml: string,
  registry: LitexmlRegistry,
): SerializedLexicalNode[] {
  const doc = parseXml(`<fragment>${xml}</fragment>`);
  const fragment = doc.querySelector('fragment') ?? doc.body;
  const ctx = createReaderContext(registry);
  return ctx.parseChildren(fragment as unknown as Element);
}

/** Structural containers whose whitespace-only text nodes are layout artifacts, not content */
const BLOCK_TAGS = new Set([
  'doc',
  'fragment',
  'root',
  'ul',
  'ol',
  'table',
  'tr',
  'blockquote',
  'alert',
  'banner',
  'details',
  'nested-doc',
  'gallery',
  'codeblock',
  'code-snippet',
  'footnote-section',
  'grid',
  'cell',
  'excalidraw',
]);

function isBlockContainer(element: Element): boolean {
  return BLOCK_TAGS.has(element.tagName.toLowerCase());
}

function createReaderContext(registry: LitexmlRegistry): ReaderContext {
  const ctx: ReaderContext = {
    parseChildren(element: Element): SerializedLexicalNode[] {
      const blockLevel = isBlockContainer(element);
      const nodes: SerializedLexicalNode[] = [];
      let pendingText = '';
      const flushText = () => {
        if (pendingText === '') return;
        // Only skip whitespace-only text in block-level containers.
        // In inline contexts, preserve all text including spaces.
        if (blockLevel && pendingText.trim() === '') {
          pendingText = '';
          return;
        }
        nodes.push(makeTextNode(pendingText, 0));
        pendingText = '';
      };
      for (const child of element.childNodes) {
        if (child.nodeType === 3 /* TEXT_NODE */) {
          // Coalesce adjacent text nodes — linkedom emits one text node per
          // character reference (`&lt;` → separate node from the chars around
          // it), and Lexical expects a single text node per contiguous run.
          pendingText += child.textContent ?? '';
        } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
          flushText();
          const el = child as Element;
          const parsed = parseElement(el, registry, ctx, 0);
          if (parsed) {
            if (Array.isArray(parsed)) nodes.push(...parsed);
            else nodes.push(parsed);
          }
        }
      }
      flushText();
      return nodes;
    },

    parseNestedState(xml: string): SerializedEditorState {
      return deserializeFromXml(xml, registry);
    },
  };
  return ctx;
}

function parseElement(
  element: Element,
  registry: LitexmlRegistry,
  ctx: ReaderContext,
  inheritedFormat: number,
): SerializedLexicalNode | SerializedLexicalNode[] | null {
  const tag = element.tagName.toLowerCase();

  // Format tags: accumulate format bits and parse children as inline
  if (isFormatTag(tag)) {
    const format = inheritedFormat | getFormatBit(tag);
    return parseInlineChildren(element, registry, ctx, format);
  }

  // <br /> → linebreak
  if (tag === 'br') {
    return { type: 'linebreak', version: 1 } as SerializedLexicalNode;
  }

  // <node> fallback elements
  if (tag === 'node') {
    return parseFallbackNode(element);
  }

  // Try registered reader
  const reader = registry.getReader(tag);
  if (reader) {
    const result = reader(element, ctx);
    if (result !== false) return result;
  }

  // Unknown tag: try parsing children as passthrough
  return ctx.parseChildren(element);
}

function parseInlineChildren(
  element: Element,
  registry: LitexmlRegistry,
  ctx: ReaderContext,
  format: number,
): SerializedLexicalNode[] {
  const nodes: SerializedLexicalNode[] = [];
  let pendingText = '';
  const flushText = () => {
    if (pendingText === '') return;
    nodes.push(makeTextNode(pendingText, format));
    pendingText = '';
  };
  for (const child of element.childNodes) {
    if (child.nodeType === 3 /* TEXT_NODE */) {
      pendingText += child.textContent ?? '';
    } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
      flushText();
      const el = child as Element;
      const parsed = parseElement(el, registry, ctx, format);
      if (parsed) {
        if (Array.isArray(parsed)) nodes.push(...parsed);
        else nodes.push(parsed);
      }
    }
  }
  flushText();
  return nodes;
}

function parseFallbackNode(element: Element): SerializedLexicalNode {
  const type = element.getAttribute('type') ?? 'unknown';
  const id = element.getAttribute('id');
  const dataStr = element.getAttribute('data');
  const data = dataStr ? JSON.parse(dataStr) : {};

  return {
    type,
    ...(id ? { $: { blockId: id } } : {}),
    ...data,
    version: 1,
  } as any;
}

function makeTextNode(text: string, format: number): SerializedLexicalNode {
  return {
    type: 'text',
    text,
    format,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
  } as any;
}
