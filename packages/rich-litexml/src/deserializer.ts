import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { parseHTML } from 'linkedom';

import type { LitexmlRegistry } from './registry';
import { getFormatBit, isFormatTag } from './text-format';
import type { ReaderContext } from './types';

function parseXml(xml: string): Document {
  // linkedom's parseHTML handles XML-like content in a Node-compatible way
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${xml}</body></html>`);
  return document;
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
      for (const child of element.childNodes) {
        if (child.nodeType === 3 /* TEXT_NODE */) {
          const text = child.textContent ?? '';
          // Only skip whitespace-only text in block-level containers
          // In inline contexts, preserve all text including spaces
          if (blockLevel && text.trim() === '') continue;
          if (text === '') continue;
          nodes.push(makeTextNode(text, 0));
        } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
          const el = child as Element;
          const parsed = parseElement(el, registry, ctx, 0);
          if (parsed) {
            if (Array.isArray(parsed)) nodes.push(...parsed);
            else nodes.push(parsed);
          }
        }
      }
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
  for (const child of element.childNodes) {
    if (child.nodeType === 3 /* TEXT_NODE */) {
      const text = child.textContent ?? '';
      if (text === '') continue;
      nodes.push(makeTextNode(text, format));
    } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
      const el = child as Element;
      const parsed = parseElement(el, registry, ctx, format);
      if (parsed) {
        if (Array.isArray(parsed)) nodes.push(...parsed);
        else nodes.push(parsed);
      }
    }
  }
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
