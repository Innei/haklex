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

  // quote / rich-quote (same XML output; rich-quote adds optional attribution)
  const writeQuote: XmlWriterFn = (node, ctx) => {
    const n = node as any;
    const attrs: Record<string, string> = { ...blockId(n) };
    if (typeof n.attribution === 'string' && n.attribution.trim() !== '') {
      attrs.attribution = n.attribution;
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
    const n = node as any;
    const attrs: Record<string, string> = { href: n.url ?? '' };
    if (n.target) attrs.target = n.target;
    if (n.title) attrs.title = n.title;
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
