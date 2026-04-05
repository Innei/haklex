import type { XmlCdata, XmlContent, XmlElement } from './types';

export interface XmlRenderOptions {
  compact?: boolean;
}

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(text: string): string {
  return text.replaceAll(/["&'<>]/g, (ch) => ESCAPE_MAP[ch]);
}

export function buildAttrs(attrs: Record<string, string>): string {
  const parts = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => ` ${k}="${escapeXml(v)}"`);
  return parts.join('');
}

function isCdata(item: XmlContent): item is XmlCdata {
  return typeof item === 'object' && 'cdata' in item;
}

function renderCdata(item: XmlCdata): string {
  return `<![CDATA[${item.cdata}]]>`;
}

/** Render XmlContent tree to XML string. */
export function renderXml(
  content: XmlContent[],
  indent: number = 0,
  options: XmlRenderOptions = {},
): string {
  const lines: string[] = [];
  for (const item of content) {
    if (typeof item === 'string') {
      lines.push(escapeXml(item));
    } else if (isCdata(item)) {
      lines.push(renderCdata(item));
    } else {
      lines.push(renderElement(item, indent, options));
    }
  }
  return lines.join('');
}

function renderElement(el: XmlElement, indent: number, options: XmlRenderOptions): string {
  const attrs = el.attrs ? buildAttrs(el.attrs) : '';
  const compact = options.compact === true;

  if (el.selfClosing) {
    return compact ? `<${el.tag}${attrs} />` : `${pad(indent)}<${el.tag}${attrs} />\n`;
  }

  if (!el.children || el.children.length === 0) {
    return compact ? `<${el.tag}${attrs} />` : `${pad(indent)}<${el.tag}${attrs} />\n`;
  }

  // Check if all children are inline (strings, CDATA, or inline elements)
  const allInline = el.children.every(
    (c) => typeof c === 'string' || isCdata(c) || isInlineElement(c),
  );

  if (allInline) {
    const inner = el.children
      .map((c) => {
        if (typeof c === 'string') return escapeXml(c);
        if (isCdata(c)) return renderCdata(c);
        return renderInline(c);
      })
      .join('');
    return compact
      ? `<${el.tag}${attrs}>${inner}</${el.tag}>`
      : `${pad(indent)}<${el.tag}${attrs}>${inner}</${el.tag}>\n`;
  }

  // Block children: each on its own line with indent
  if (compact) {
    const inner = el.children
      .map((c) => {
        if (typeof c === 'string') return escapeXml(c);
        if (isCdata(c)) return renderCdata(c);
        return renderElement(c, indent + 1, options);
      })
      .join('');
    return `<${el.tag}${attrs}>${inner}</${el.tag}>`;
  }

  const inner = el.children
    .map((c) => {
      if (typeof c === 'string') return `${pad(indent + 1)}${escapeXml(c)}\n`;
      if (isCdata(c)) return `${pad(indent + 1)}${renderCdata(c)}\n`;
      return renderElement(c, indent + 1, options);
    })
    .join('');
  return `${pad(indent)}<${el.tag}${attrs}>\n${inner}${pad(indent)}</${el.tag}>\n`;
}

function renderInline(el: XmlElement): string {
  const attrs = el.attrs ? buildAttrs(el.attrs) : '';
  if (el.selfClosing || !el.children || el.children.length === 0) {
    return `<${el.tag}${attrs} />`;
  }
  const inner = el.children
    .map((c) => (typeof c === 'string' ? escapeXml(c) : renderInline(c)))
    .join('');
  return `<${el.tag}${attrs}>${inner}</${el.tag}>`;
}

function isInlineElement(el: XmlElement): boolean {
  const inlineTags = new Set([
    'b',
    'i',
    'u',
    's',
    'code',
    'sub',
    'sup',
    'mark',
    'strong',
    'em',
    'del',
    'a',
    'mention',
    'tag',
    'spoiler',
    'ruby',
    'math',
    'footnote',
    'comment',
  ]);
  return inlineTags.has(el.tag);
}

function pad(indent: number): string {
  return '  '.repeat(indent);
}
