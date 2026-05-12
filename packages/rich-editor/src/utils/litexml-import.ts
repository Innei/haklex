import { createDefaultRegistry, deserializeNodesFromXml } from '@haklex/rich-litexml';
import type { SerializedLexicalNode } from 'lexical';

const LITEXML_TAGS = [
  'doc',
  'fragment',
  'img',
  'video',
  'link-card',
  'embed',
  'codeblock',
  'mermaid',
  'math',
  'alert',
  'banner',
  'nested-doc',
  'details',
  'spoiler',
  'ruby',
  'mention',
  'tag',
  'comment',
  'footnote',
  'footnote-section',
  'gallery',
  'excalidraw',
  'grid',
  'cell',
  'agent-diff',
  'code-snippet',
  'chat',
  'poll',
];

const LITEXML_TAG_PATTERN = new RegExp(`<\\/?(?:${LITEXML_TAGS.join('|')})(?:\\s|>|\\/>)`, 'i');

export function detectLiteXml(text: string): boolean {
  return LITEXML_TAG_PATTERN.test(text.trim());
}

export function parseLiteXmlSerializedNodes(xml: string): SerializedLexicalNode[] | null {
  if (!detectLiteXml(xml)) return null;

  const registry = createDefaultRegistry();
  const nodes = deserializeNodesFromXml(xml, registry);
  return nodes.length > 0 ? nodes : null;
}
