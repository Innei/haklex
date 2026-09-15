import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

import type { LitexmlRegistry } from './registry';
import { wrapContentWithFormatTags, wrapWithFormatTags } from './text-format';
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

type TextRun = { text: string; format: number };

function isTextRun(node: SerializedLexicalNode): boolean {
  return (node as any).type === 'text';
}

// Adjacent text nodes that share format bits serialize under one wrapper
// (`<b>a<code>b</code>c</b>`), not one wrapper per node (`<b>a</b><b><code>b</code></b><b>c</b>`).
// Both parse to the same nodes; the merged form is what editors and models expect.
function serializeTextRun(run: TextRun[]): XmlContent[] {
  if (run.length === 1) return wrapWithFormatTags(run[0].text, run[0].format);

  const common = run.reduce((acc, node) => acc & node.format, ~0);
  if (common !== 0) {
    const inner = serializeTextRun(run.map((node) => ({ ...node, format: node.format & ~common })));
    return wrapContentWithFormatTags(inner, common);
  }

  const groups: TextRun[][] = [];
  for (const node of run) {
    const last = groups.at(-1);
    if (last && (last.at(-1).format & node.format) !== 0) last.push(node);
    else groups.push([node]);
  }
  if (groups.length === 1) return run.flatMap((node) => wrapWithFormatTags(node.text, node.format));
  return groups.flatMap((group) => serializeTextRun(group));
}

function serializeSiblings(nodes: SerializedLexicalNode[], ctx: WriterContext): XmlContent[] {
  const out: XmlContent[] = [];
  let run: TextRun[] = [];
  const flush = () => {
    if (run.length > 0) out.push(...serializeTextRun(run));
    run = [];
  };
  for (const node of nodes) {
    if (isTextRun(node)) {
      const n = node as any;
      run.push({ text: n.text ?? '', format: n.format ?? 0 });
      continue;
    }
    flush();
    const result = ctx.serializeNode(node);
    if (Array.isArray(result)) out.push(...result);
    else out.push(result);
  }
  flush();
  return out;
}

function createWriterContext(registry: LitexmlRegistry): WriterContext {
  const ctx: WriterContext = {
    serializeChildren(children: SerializedLexicalNode[]): XmlContent[] {
      return serializeSiblings(children, ctx);
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
      return serializeSiblings(children, ctx);
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
