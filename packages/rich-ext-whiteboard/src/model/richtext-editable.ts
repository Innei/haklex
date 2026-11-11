import type { RichNode, RichTextContent } from './richtext';
import { contentRoot, richTextPlainText } from './richtext';

const ELEMENT = { direction: null, format: '', indent: 0, version: 1 };

const text = (value: string, from?: RichNode): RichNode => ({
  type: 'text',
  text: value,
  format: typeof from?.format === 'number' ? from.format : 0,
  style: typeof from?.style === 'string' ? from.style : '',
  detail: 0,
  mode: 'normal',
  version: 1,
});

function inline(node: RichNode): RichNode[] {
  switch (node.type) {
    case 'text': {
      return [text(node.text ?? '', node)];
    }
    case 'linebreak':
    case 'tab': {
      return [{ type: node.type, version: 1 }];
    }
    case 'link':
    case 'autolink': {
      return [
        {
          ...ELEMENT,
          type: 'link',
          url: typeof node.url === 'string' ? node.url : '',
          rel: 'noopener noreferrer',
          target: '_blank',
          title: null,
          children: (node.children ?? []).flatMap(inline),
        },
      ];
    }
    default: {
      const value = richTextPlainText(node);
      return value ? [text(value)] : [];
    }
  }
}

const paragraph = (children: RichNode[]): RichNode => ({
  ...ELEMENT,
  type: 'paragraph',
  textFormat: 0,
  textStyle: '',
  children,
});

function listItem(node: RichNode, index: number): RichNode {
  const children = (node.children ?? []).flatMap((child) =>
    child.type === 'list' ? [list(child)] : inline(child),
  );
  return { ...ELEMENT, type: 'listitem', value: index + 1, checked: undefined, children };
}

function list(node: RichNode): RichNode {
  const listType =
    node.listType === 'number' || node.listType === 'check' ? node.listType : 'bullet';
  return {
    ...ELEMENT,
    type: 'list',
    listType,
    start: 1,
    tag: listType === 'number' ? 'ol' : 'ul',
    children: (node.children ?? []).map((item, i) =>
      listItem(item.type === 'listitem' ? item : { type: 'listitem', children: [item] }, i),
    ),
  };
}

function block(node: RichNode): RichNode {
  switch (node.type) {
    case 'paragraph': {
      return paragraph((node.children ?? []).flatMap(inline));
    }
    case 'heading': {
      const tag = /^h[1-6]$/.test(node.tag ?? '') ? node.tag : 'h3';
      return { ...ELEMENT, type: 'heading', tag, children: (node.children ?? []).flatMap(inline) };
    }
    case 'quote': {
      return { ...ELEMENT, type: 'quote', children: (node.children ?? []).flatMap(inline) };
    }
    case 'list': {
      return list(node);
    }
    default: {
      return paragraph(inline(node));
    }
  }
}

export function toEditableContent(content: unknown): RichTextContent {
  const blocks = (contentRoot(content).children ?? []).map(block);
  return {
    root: { ...ELEMENT, type: 'root', children: blocks.length > 0 ? blocks : [paragraph([])] },
  };
}
