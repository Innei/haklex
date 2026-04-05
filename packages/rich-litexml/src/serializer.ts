import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

import type { LitexmlRegistry } from './registry';
import { wrapWithFormatTags } from './text-format';
import type { WriterContext, XmlContent } from './types';
import { renderXml, type XmlRenderOptions } from './xml-utils';

export interface XmlSerializerOptions extends XmlRenderOptions {
  selectedBlockIds?: Set<string>;
}

export function serializeToXml(
  state: SerializedEditorState,
  registry: LitexmlRegistry,
  options: XmlSerializerOptions = {},
): string {
  const root = state.root as any;
  const children: SerializedLexicalNode[] = root.children ?? [];
  const selectedBlockIds = options.selectedBlockIds;

  const ctx = createWriterContext(registry);
  const content = children.flatMap((child) => {
    const result = ctx.serializeNode(child);
    const items = Array.isArray(result) ? result : [result];

    if (!selectedBlockIds?.size) return items;

    const blockId = (child as any).$?.blockId;
    if (!blockId || !selectedBlockIds.has(blockId)) return items;

    return items.map((item): XmlContent => {
      if (typeof item === 'string' || 'cdata' in item) return item;
      return { ...item, attrs: { ...item.attrs, selected: 'true' } };
    });
  });

  if (options.compact) {
    return `<doc>${renderXml(content, 0, options)}</doc>`;
  }

  return `<doc>\n${renderXml(content, 1, options)}</doc>\n`;
}

export function serializeNodesToXml(
  nodes: SerializedLexicalNode[],
  registry: LitexmlRegistry,
  options: XmlSerializerOptions = {},
): string {
  const ctx = createWriterContext(registry);
  const content = nodes.flatMap((node) => ctx.serializeNode(node));
  return renderXml(content, 0, options);
}

function createWriterContext(registry: LitexmlRegistry): WriterContext {
  const ctx: WriterContext = {
    serializeChildren(children: SerializedLexicalNode[]): XmlContent[] {
      return children.flatMap((child) => ctx.serializeNode(child));
    },

    serializeNode(node: SerializedLexicalNode): XmlContent | XmlContent[] {
      const n = node as any;

      // Text nodes: apply format wrapping
      if (n.type === 'text') {
        return wrapWithFormatTags(n.text ?? '', n.format ?? 0);
      }

      // Linebreak
      if (n.type === 'linebreak') {
        return { tag: 'br', selfClosing: true };
      }

      // Try registered writer
      const writer = registry.getWriter(n.type);
      if (writer) {
        const result = writer(node, ctx);
        if (result !== false) return result;
      }

      // Fallback: opaque <node> element
      return serializeFallback(node);
    },

    serializeNestedState(state: SerializedEditorState): XmlContent[] {
      const root = state.root as any;
      const children: SerializedLexicalNode[] = root.children ?? [];
      return children.flatMap((child) => ctx.serializeNode(child));
    },
  };
  return ctx;
}

function serializeFallback(node: SerializedLexicalNode): XmlContent {
  const n = node as any;
  const blockId = n.$?.blockId;
  const { type, $: _meta, version: _v, ...rest } = n;
  const attrs: Record<string, string> = { type };
  if (blockId) attrs.id = blockId;

  const dataKeys = Object.keys(rest);
  if (dataKeys.length > 0) {
    attrs.data = JSON.stringify(rest);
  }

  return { tag: 'node', attrs, selfClosing: true };
}
