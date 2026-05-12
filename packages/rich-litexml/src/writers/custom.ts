import type { LitexmlRegistry } from '../registry';
import type { XmlElement } from '../types';

function blockId(node: any): Record<string, string> {
  return node.$?.blockId ? { id: node.$.blockId } : {};
}

function optAttr(attrs: Record<string, string | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== undefined && v !== null && v !== '') result[k] = String(v);
  }
  return result;
}

export function registerCustomWriters(registry: LitexmlRegistry): void {
  // -- Pattern A: simple attributes (self-closing) --

  registry.registerWriter('image', (node) => {
    const n = node as any;
    return {
      tag: 'img',
      attrs: optAttr({
        ...blockId(n),
        src: n.src,
        alt: n.altText,
        width: n.width != null ? String(n.width) : undefined,
        height: n.height != null ? String(n.height) : undefined,
        caption: n.caption,
        thumbhash: n.thumbhash,
        accent: n.accent,
      }),
      selfClosing: true,
    };
  });

  registry.registerWriter('video', (node) => {
    const n = node as any;
    return {
      tag: 'video',
      attrs: optAttr({ ...blockId(n), src: n.src, poster: n.poster }),
      selfClosing: true,
    };
  });

  registry.registerWriter('link-card', (node) => {
    const n = node as any;
    return {
      tag: 'link-card',
      attrs: optAttr({
        ...blockId(n),
        url: n.url,
        source: n.source,
        title: n.title,
        description: n.description,
        favicon: n.favicon,
        image: n.image,
      }),
      selfClosing: true,
    };
  });

  registry.registerWriter('embed', (node) => {
    const n = node as any;
    return {
      tag: 'embed',
      attrs: optAttr({ ...blockId(n), url: n.url, source: n.source }),
      selfClosing: true,
    };
  });

  // -- Pattern B: text content --

  registry.registerWriter('code-block', (node) => {
    const n = node as any;
    return {
      tag: 'codeblock',
      attrs: optAttr({ ...blockId(n), lang: n.language }),
      children: [n.code ?? ''],
    };
  });

  registry.registerWriter('mermaid', (node) => {
    const n = node as any;
    return {
      tag: 'mermaid',
      attrs: blockId(n),
      children: [n.diagram ?? ''],
    };
  });

  registry.registerWriter('katex-block', (node) => {
    const n = node as any;
    return {
      tag: 'math',
      attrs: { ...blockId(n), display: 'block' },
      children: [n.equation ?? ''],
    };
  });

  registry.registerWriter('katex-inline', (node) => {
    const n = node as any;
    const attrs: Record<string, string> = {};
    if (n.color) attrs.color = n.color;
    return {
      tag: 'math',
      attrs: Object.keys(attrs).length > 0 ? attrs : undefined,
      children: [n.equation ?? ''],
    };
  });

  // -- Pattern C: nested EditorState --

  registry.registerWriter('alert-quote', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'alert',
      attrs: optAttr({ ...blockId(n), type: n.alertType }),
      children: ctx.serializeNestedState(n.content),
    };
  });

  registry.registerWriter('banner', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'banner',
      attrs: optAttr({ ...blockId(n), type: n.bannerType }),
      children: ctx.serializeNestedState(n.content),
    };
  });

  registry.registerWriter('nested-doc', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'nested-doc',
      attrs: blockId(n),
      children: ctx.serializeNestedState(n.content ?? n.contentState),
    };
  });

  // -- Excalidraw: preserve snapshot as opaque attribute for round-trip --

  registry.registerWriter('excalidraw', (node) => {
    const n = node as any;
    if (!n.snapshot) {
      return {
        tag: 'excalidraw',
        attrs: optAttr(blockId(n)),
        selfClosing: true,
      };
    }
    return {
      tag: 'excalidraw',
      attrs: optAttr(blockId(n)),
      children: [{ cdata: n.snapshot }],
    };
  });

  // -- Grid container: cols + gap + cells as nested editor states --

  registry.registerWriter('grid-container', (node, ctx) => {
    const n = node as any;
    const cells: XmlElement[] = (n.cells ?? []).map((cellState: any) => ({
      tag: 'cell',
      children: ctx.serializeNestedState(cellState),
    }));
    return {
      tag: 'grid',
      attrs: optAttr({
        ...blockId(n),
        cols: n.cols != null ? String(n.cols) : undefined,
        gap: n.gap,
      }),
      children: cells,
    };
  });

  // -- Agent diff: editing marker --

  registry.registerWriter('agent-diff', (node) => {
    const n = node as any;
    return {
      tag: 'agent-diff',
      attrs: optAttr({ ...blockId(n), op: n.opType, entry: n.diffEntryId }),
      selfClosing: true,
    };
  });

  // -- Pattern D: element with children --

  registry.registerWriter('details', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'details',
      attrs: optAttr({
        ...blockId(n),
        summary: n.summary,
        open: n.open != null ? String(n.open) : undefined,
      }),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  registry.registerWriter('spoiler', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'spoiler',
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  registry.registerWriter('ruby', (node, ctx) => {
    const n = node as any;
    return {
      tag: 'ruby',
      attrs: optAttr({ rt: n.reading }),
      children: ctx.serializeChildren(n.children ?? []),
    };
  });

  // -- Pattern E: inline --

  registry.registerWriter('mention', (node) => {
    const n = node as any;
    return {
      tag: 'mention',
      attrs: optAttr({ platform: n.platform, handle: n.handle }),
      children: [n.displayName ?? n.handle ?? ''],
    };
  });

  registry.registerWriter('tag', (node) => {
    const n = node as any;
    return { tag: 'tag', children: [n.text ?? ''] };
  });

  registry.registerWriter('comment', (node) => {
    const n = node as any;
    return { tag: 'comment', children: [n.text ?? ''] };
  });

  registry.registerWriter('footnote', (node) => {
    const n = node as any;
    return { tag: 'footnote', attrs: { ref: n.identifier ?? '' }, selfClosing: true };
  });

  registry.registerWriter('footnote-section', (node) => {
    const n = node as any;
    const defs = n.definitions ?? {};
    const children: XmlElement[] = Object.entries(defs).map(([ref, text]) => ({
      tag: 'def',
      attrs: { ref },
      children: [text as string],
    }));
    return { tag: 'footnote-section', attrs: blockId(n), children };
  });

  registry.registerWriter('gallery', (node) => {
    const n = node as any;
    const images: XmlElement[] = (n.images ?? []).map((img: any) => ({
      tag: 'img',
      attrs: optAttr({ src: img.src, alt: img.alt }),
      selfClosing: true,
    }));
    return {
      tag: 'gallery',
      attrs: optAttr({ ...blockId(n), layout: n.layout }),
      children: images,
    };
  });

  registry.registerWriter('code-snippet', (node) => {
    const n = node as any;
    const files: XmlElement[] = (n.files ?? []).map((f: any) => ({
      tag: 'file',
      attrs: optAttr({ name: f.filename, lang: f.language }),
      children: [f.code ?? ''],
    }));
    return { tag: 'code-snippet', attrs: blockId(n), children: files };
  });

  registry.registerWriter('chat', (node) => {
    const n = node as any;
    const participantsEl: XmlElement = {
      tag: 'participants',
      children: (n.participants ?? []).map((p: any) => ({
        tag: 'participant',
        attrs: optAttr({
          id: p.id,
          kind: p.kind,
          name: p.name,
          avatar: p.avatar,
        }),
        children: [],
      })),
    };
    const messagesEl: XmlElement = {
      tag: 'messages',
      children: (n.messages ?? []).map((m: any) => ({
        tag: 'message',
        attrs: optAttr({ id: m.id, participant: m.participantId }),
        children: [m.content ?? ''],
      })),
    };
    return {
      tag: 'chat',
      attrs: optAttr({ ...blockId(n), variant: n.variant }),
      children: [participantsEl, messagesEl],
    };
  });

  registry.registerWriter('poll', (node) => {
    const n = node as any;
    const optionElements: XmlElement[] = (n.options ?? []).map(
      (option: { id: string; label: string }) => ({
        tag: 'option',
        attrs: optAttr({ id: option.id }),
        children: [option.label ?? ''],
      }),
    );
    return {
      tag: 'poll',
      attrs: optAttr({
        ...blockId(n),
        'poll-id': n.pollId,
        'mode': n.mode,
        'close-at': n.closeAt,
        'show-results': n.showResults,
      }),
      children: [{ tag: 'question', children: [n.question ?? ''] }, ...optionElements],
    };
  });
}
