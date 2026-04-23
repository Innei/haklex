import type { SerializedEditorState } from 'lexical';

import type { LitexmlRegistry } from '../registry';

function extractBlockId(el: Element): Record<string, any> {
  const id = el.getAttribute('id');
  return id ? { $: { blockId: id } } : {};
}

function numAttr(el: Element, name: string): number | undefined {
  const v = el.getAttribute(name);
  return v !== null ? Number(v) : undefined;
}

/**
 * Extract CDATA text content from an element.
 * linkedom (HTML parser) converts <![CDATA[...]]> to a comment node
 * with value "[CDATA[...]]", so we detect that pattern.
 */
function extractCdataText(el: Element): string {
  for (const child of el.childNodes) {
    if (child.nodeType === 8 /* COMMENT_NODE */) {
      const val = child.nodeValue ?? '';
      if (val.startsWith('[CDATA[') && val.endsWith(']]')) {
        return val.slice(7, -2);
      }
    }
  }
  return el.textContent?.trim() ?? '';
}

export function registerCustomReaders(registry: LitexmlRegistry): void {
  // -- Pattern A: simple attributes --

  registry.registerReader('img', (el) => {
    // Standalone image block (not inside gallery)
    if (el.parentElement?.tagName.toLowerCase() === 'gallery') return false;
    return {
      type: 'image',
      ...extractBlockId(el),
      src: el.getAttribute('src') ?? '',
      altText: el.getAttribute('alt') ?? '',
      width: numAttr(el, 'width'),
      height: numAttr(el, 'height'),
      caption: el.getAttribute('caption') ?? undefined,
      thumbhash: el.getAttribute('thumbhash') ?? undefined,
      accent: el.getAttribute('accent') ?? undefined,
      version: 1,
    } as any;
  });

  registry.registerReader(
    'video',
    (el) =>
      ({
        type: 'video',
        ...extractBlockId(el),
        src: el.getAttribute('src') ?? '',
        poster: el.getAttribute('poster') ?? undefined,
        width: numAttr(el, 'width'),
        height: numAttr(el, 'height'),
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'linkcard',
    (el) =>
      ({
        type: 'link-card',
        ...extractBlockId(el),
        url: el.getAttribute('url') ?? '',
        source: el.getAttribute('source') ?? undefined,
        title: el.getAttribute('title') ?? undefined,
        description: el.getAttribute('description') ?? undefined,
        favicon: el.getAttribute('favicon') ?? undefined,
        image: el.getAttribute('image') ?? undefined,
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'embed',
    (el) =>
      ({
        type: 'embed',
        ...extractBlockId(el),
        url: el.getAttribute('url') ?? '',
        source: el.getAttribute('source') ?? null,
        version: 1,
      }) as any,
  );

  // -- Pattern B: text content --

  registry.registerReader(
    'codeblock',
    (el) =>
      ({
        type: 'code-block',
        ...extractBlockId(el),
        code: el.textContent ?? '',
        language: el.getAttribute('lang') ?? '',
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'mermaid',
    (el) =>
      ({
        type: 'mermaid',
        ...extractBlockId(el),
        diagram: el.textContent ?? '',
        version: 1,
      }) as any,
  );

  // math: block or inline depending on display attribute
  registry.registerReader('math', (el) => {
    const display = el.getAttribute('display');
    if (display === 'block') {
      return {
        type: 'katex-block',
        ...extractBlockId(el),
        equation: el.textContent ?? '',
        version: 1,
      } as any;
    }
    const color = el.getAttribute('color');
    return {
      type: 'katex-inline',
      equation: el.textContent ?? '',
      ...(color ? { color } : {}),
      version: 1,
    } as any;
  });

  // -- Pattern C: nested EditorState --

  registry.registerReader('alert', (el, ctx) => {
    const children = ctx.parseChildren(el);
    const content: SerializedEditorState = {
      root: {
        type: 'root',
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as SerializedEditorState;
    return {
      type: 'alert-quote',
      ...extractBlockId(el),
      alertType: el.getAttribute('type') ?? 'note',
      content,
      version: 1,
    } as any;
  });

  registry.registerReader('banner', (el, ctx) => {
    const children = ctx.parseChildren(el);
    const content: SerializedEditorState = {
      root: {
        type: 'root',
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as SerializedEditorState;
    return {
      type: 'banner',
      ...extractBlockId(el),
      bannerType: el.getAttribute('type') ?? 'note',
      content,
      version: 1,
    } as any;
  });

  registry.registerReader('nesteddoc', (el, ctx) => {
    const children = ctx.parseChildren(el);
    const content: SerializedEditorState = {
      root: {
        type: 'root',
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    } as SerializedEditorState;
    return {
      type: 'nested-doc',
      ...extractBlockId(el),
      content,
      version: 1,
    } as any;
  });

  // -- Pattern D: element with children --

  registry.registerReader(
    'details',
    (el, ctx) =>
      ({
        type: 'details',
        ...extractBlockId(el),
        summary: el.getAttribute('summary') ?? '',
        open: el.getAttribute('open') === 'true',
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'spoiler',
    (el, ctx) =>
      ({
        type: 'spoiler',
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'ruby',
    (el, ctx) =>
      ({
        type: 'ruby',
        reading: el.getAttribute('rt') ?? '',
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      }) as any,
  );

  // -- Pattern E: inline --

  registry.registerReader(
    'mention',
    (el) =>
      ({
        type: 'mention',
        platform: el.getAttribute('platform') ?? '',
        handle: el.getAttribute('handle') ?? '',
        displayName: el.textContent || undefined,
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'tag',
    (el) =>
      ({
        type: 'tag',
        text: el.textContent ?? '',
        format: 0,
        detail: 0,
        mode: 'normal',
        style: '',
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'comment',
    (el) =>
      ({
        type: 'comment',
        text: el.textContent ?? '',
        format: 0,
        detail: 0,
        mode: 'normal',
        style: '',
        version: 1,
      }) as any,
  );

  registry.registerReader(
    'footnote',
    (el) =>
      ({
        type: 'footnote',
        identifier: el.getAttribute('ref') ?? '',
        version: 1,
      }) as any,
  );

  registry.registerReader('footnotesection', (el) => {
    const definitions: Record<string, string> = {};
    for (const child of el.children) {
      if (child.tagName.toLowerCase() === 'def') {
        const ref = child.getAttribute('ref') ?? '';
        definitions[ref] = child.textContent ?? '';
      }
    }
    return {
      type: 'footnote-section',
      ...extractBlockId(el),
      definitions,
      version: 1,
    } as any;
  });

  registry.registerReader('gallery', (el) => {
    const images: Array<{ src: string; alt?: string }> = [];
    for (const child of el.children) {
      if (child.tagName.toLowerCase() === 'img') {
        images.push({
          src: child.getAttribute('src') ?? '',
          alt: child.getAttribute('alt') ?? undefined,
        });
      }
    }
    return {
      type: 'gallery',
      ...extractBlockId(el),
      images,
      layout: el.getAttribute('layout') ?? 'grid',
      version: 1,
    } as any;
  });

  // -- Excalidraw: opaque snapshot preserved --

  registry.registerReader(
    'excalidraw',
    (el) =>
      ({
        type: 'excalidraw',
        ...extractBlockId(el),
        snapshot: extractCdataText(el) || el.getAttribute('snapshot') || '',
        version: 1,
      }) as any,
  );

  // -- Grid container: cols + gap + nested cell states --

  registry.registerReader('grid', (el, ctx) => {
    const cells: SerializedEditorState[] = [];
    for (const child of el.children) {
      if (child.tagName.toLowerCase() === 'cell') {
        const children = ctx.parseChildren(child);
        cells.push({
          root: {
            type: 'root',
            children,
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        } as SerializedEditorState);
      }
    }
    return {
      type: 'grid-container',
      ...extractBlockId(el),
      cols: numAttr(el, 'cols') ?? 2,
      gap: el.getAttribute('gap') ?? '16px',
      cells,
      version: 1,
    } as any;
  });

  // -- Agent diff: editing marker --

  registry.registerReader(
    'agentdiff',
    (el) =>
      ({
        type: 'agent-diff',
        ...extractBlockId(el),
        opType: el.getAttribute('op') ?? 'insert',
        diffEntryId: el.getAttribute('entry') ?? '',
        version: 1,
      }) as any,
  );

  registry.registerReader('codesnippet', (el) => {
    const files: Array<{ filename: string; code: string; language: string }> = [];
    for (const child of el.children) {
      if (child.tagName.toLowerCase() === 'file') {
        files.push({
          filename: child.getAttribute('name') ?? '',
          code: child.textContent ?? '',
          language: child.getAttribute('lang') ?? '',
        });
      }
    }
    return {
      type: 'code-snippet',
      ...extractBlockId(el),
      files,
      version: 1,
    } as any;
  });
}
