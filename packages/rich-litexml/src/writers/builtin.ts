import type { SerializedLexicalNode } from 'lexical';

import type { LitexmlRegistry } from '../registry';
import type { XmlWriterFn } from '../types';

function blockId(node: any): Record<string, string> {
  return node.$?.blockId ? { id: node.$.blockId } : {};
}

export function registerBuiltinWriters(registry: LitexmlRegistry): void {
  // paragraph
  registry.registerWriter('paragraph', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'p',
      attrs: blockId(n),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // heading
  registry.registerWriter('heading', (node, ctx) => {
    const n = node as any;
    const tag = n.tag ?? 'h1';
    return {
      tag,
      attrs: blockId(n),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // quote / rich-quote
  //
  // The two node types share the `<blockquote>` tag, so the reader needs a
  // marker to tell them apart: without one, a rich quote whose `attribution`
  // is null round-trips into a plain quote. `attribution` alone cannot carry
  // that signal because `buildAttrs` drops empty values, so an explicit
  // `rich` flag accompanies it.
  const writeQuote: XmlWriterFn = (node, ctx) => {
    const n = node as SerializedLexicalNode & {
      attribution?: unknown;
      children?: SerializedLexicalNode[];
      type?: string;
    };
    const attrs: Record<string, string> = { ...blockId(n) };
    if (n.type === 'rich-quote') {
      const attribution = typeof n.attribution === 'string' ? n.attribution.trim() : '';
      if (attribution !== '') {
        attrs.attribution = n.attribution as string;
      } else {
        // A rich quote with no attribution has no other trace of its type, so
        // it needs the explicit flag; an attributed one is already
        // distinguishable and keeps the historical shape.
        attrs.rich = 'true';
      }
    }
    return {
      tag: 'blockquote',
      attrs,
      children: ctx.serializeChildren(n.children ?? []),
    };
  };
  registry.registerWriter('quote', writeQuote);
  registry.registerWriter('rich-quote', writeQuote);

  // horizontalrule
  registry.registerWriter('horizontalrule', (node) => {
    const n = node as any;
    return { tag: 'hr', attrs: blockId(n), selfClosing: true };
  });

  // list
  registry.registerWriter('list', (node, ctx) => {
    const n = node as any;
    const tag = n.listType === 'number' ? 'ol' : 'ul';
    const attrs: Record<string, string> = { ...blockId(n) };
    if (n.listType === 'check') attrs.type = 'check';
    return {
      tag,
      attrs,
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // listitem
  registry.registerWriter('listitem', (node, ctx) => {
    const n = node as any;
    const attrs: Record<string, string> = { ...blockId(n) };
    if (n.checked !== undefined) attrs.checked = String(n.checked);
    return {
      tag: 'li',
      attrs,
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // link
  registry.registerWriter('link', (node, ctx) => {
    const n = node as SerializedLexicalNode & {
      children?: SerializedLexicalNode[];
      rel?: unknown;
      target?: unknown;
      title?: unknown;
      url?: unknown;
    };
    const attrs: Record<string, string> = {
      href: typeof n.url === 'string' ? n.url : '',
    };
    if (typeof n.target === 'string' && n.target !== '') attrs.target = n.target;
    if (typeof n.title === 'string' && n.title !== '') attrs.title = n.title;
    if (typeof n.rel === 'string' && n.rel !== '') attrs.rel = n.rel;
    return {
      tag: 'a',
      attrs,
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // autolink (same as link)
  registry.registerWriter('autolink', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'a',
      attrs: { href: n.url ?? '' },
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // table
  registry.registerWriter('table', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'table',
      attrs: blockId(n),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // tablerow
  registry.registerWriter('tablerow', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'tr',
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // tablecell
  registry.registerWriter('tablecell', (node, ctx) => {
    const n = node as any;
    const tag = n.headerState === 1 ? 'th' : 'td';
    return {
      tag,
      children: ctx.serializeChildren(n.children ?? []),
    };
  });
}
