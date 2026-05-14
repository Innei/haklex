import type { LitexmlRegistry } from '../registry';

function extractBlockId(el: Element): Record<string, any> {
  const id = el.getAttribute('id');
  return id ? { $: { blockId: id } } : {};
}

const ELEMENT_DEFAULTS = {
  direction: 'ltr' as const,
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
};

export function registerBuiltinReaders(registry: LitexmlRegistry): void {
  // paragraph
  registry.registerReader(
    'p',
    (el, ctx) =>
      ({
        type: 'paragraph',
        ...extractBlockId(el),
        children: ctx.parseChildren(el),
        ...ELEMENT_DEFAULTS,
      }) as any,
  );

  // headings h1-h6
  for (let level = 1; level <= 6; level++) {
    registry.registerReader(
      `h${level}`,
      (el, ctx) =>
        ({
          type: 'heading',
          tag: `h${level}`,
          ...extractBlockId(el),
          children: ctx.parseChildren(el),
          ...ELEMENT_DEFAULTS,
        }) as any,
    );
  }

  // blockquote
  registry.registerReader('blockquote', (el, ctx) => {
    const attribution = el.getAttribute('attribution');
    const base = {
      ...extractBlockId(el),
      children: ctx.parseChildren(el),
      ...ELEMENT_DEFAULTS,
    };
    if (attribution !== null) {
      return { type: 'rich-quote', attribution, ...base } as any;
    }
    return { type: 'quote', ...base } as any;
  });

  // horizontal rule
  registry.registerReader(
    'hr',
    (el) =>
      ({
        type: 'horizontalrule',
        ...extractBlockId(el),
        version: 1,
      }) as any,
  );

  // unordered list
  registry.registerReader('ul', (el, ctx) => {
    const isCheck = el.getAttribute('type') === 'check';
    return {
      type: 'list',
      listType: isCheck ? 'check' : 'bullet',
      tag: 'ul',
      start: 1,
      ...extractBlockId(el),
      children: ctx.parseChildren(el),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    } as any;
  });

  // ordered list
  registry.registerReader(
    'ol',
    (el, ctx) =>
      ({
        type: 'list',
        listType: 'number',
        tag: 'ol',
        start: Number(el.getAttribute('start') ?? 1),
        ...extractBlockId(el),
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // list item
  registry.registerReader('li', (el, ctx) => {
    const checked = el.getAttribute('checked');
    return {
      type: 'listitem',
      ...extractBlockId(el),
      ...(checked !== null ? { checked: checked === 'true' } : {}),
      children: ctx.parseChildren(el),
      ...ELEMENT_DEFAULTS,
      value: 1,
    } as any;
  });

  // link
  registry.registerReader(
    'a',
    (el, ctx) =>
      ({
        type: 'link',
        url: el.getAttribute('href') ?? '',
        target: el.getAttribute('target') ?? null,
        title: el.getAttribute('title') ?? null,
        rel: null,
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // table
  registry.registerReader(
    'table',
    (el, ctx) =>
      ({
        type: 'table',
        ...extractBlockId(el),
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // table row
  registry.registerReader(
    'tr',
    (el, ctx) =>
      ({
        type: 'tablerow',
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // table header cell
  registry.registerReader(
    'th',
    (el, ctx) =>
      ({
        type: 'tablecell',
        headerState: 1,
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );

  // table data cell
  registry.registerReader(
    'td',
    (el, ctx) =>
      ({
        type: 'tablecell',
        headerState: 0,
        children: ctx.parseChildren(el),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }) as any,
  );
}
