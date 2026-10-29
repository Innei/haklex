import { $createRubyNode, $isKaTeXInlineNode, $isRubyNode } from '@haklex/rich-editor/nodes';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import type { LexicalEditor, RangeSelection } from 'lexical';
import {
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
} from 'lexical';

import { collectSelectedActiveAutoLinkNodes, isRegularLinkNode } from './selection-state';

export interface RubyDraft {
  isNew: boolean;
  nodeKey: string;
  reading: string;
}

const SCHEME = /^[a-z][\d+.a-z-]*:/i;
const LOOKS_LIKE_URL = /^(?:https?:\/\/|www\.)\S+$|^[\w-]+(?:\.[\w-]+)+(?:[#/?]\S*)?$/i;

export function normalizeUrl(input: string): string {
  const url = input.trim();
  if (!url) return '';
  if (SCHEME.test(url) || url.startsWith('/') || url.startsWith('#')) return url;
  return `https://${url}`;
}

export function looksLikeUrl(text: string): boolean {
  return LOOKS_LIKE_URL.test(text.trim());
}

export async function readClipboardUrl(): Promise<string> {
  try {
    const status = await navigator.permissions?.query({
      name: 'clipboard-read' as PermissionName,
    });
    if (status?.state !== 'granted') return '';
    const text = (await navigator.clipboard?.readText())?.trim() ?? '';
    return looksLikeUrl(text) ? text : '';
  } catch {
    return '';
  }
}

export function $removeLinks(editor: LexicalEditor, selection: RangeSelection) {
  for (const autoLinkNode of collectSelectedActiveAutoLinkNodes(selection)) {
    autoLinkNode.setIsUnlinked(true);
    autoLinkNode.markDirty();
  }

  const hasRegularLink = selection.getNodes().some((node) => {
    const parent = node.getParent();
    return isRegularLinkNode(parent) || isRegularLinkNode(node);
  });

  if (hasRegularLink) {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  }
}

export function $clearFormatting() {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;
  for (const node of selection.extract()) {
    if ($isTextNode(node)) {
      node.setFormat(0);
      node.setStyle('');
    } else if ($isKaTeXInlineNode(node)) {
      node.setColor(null);
    }
  }
}

export function $wrapSelectionInRuby(): RubyDraft | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;
  const text = selection.getTextContent();
  if (!text.trim()) return null;

  selection.removeText();
  const rubyNode = $createRubyNode('');
  rubyNode.append($createTextNode(text));
  const freshSelection = $getSelection();
  if ($isRangeSelection(freshSelection)) {
    freshSelection.insertNodes([rubyNode]);
  }
  return { nodeKey: rubyNode.getKey(), reading: '', isNew: true };
}

export function $unwrapRuby(nodeKey: string) {
  const node = $getNodeByKey(nodeKey);
  if (!$isRubyNode(node)) return;
  for (const child of node.getChildren()) {
    node.insertBefore(child);
  }
  node.remove();
}

export function $setRubyReading(nodeKey: string, reading: string) {
  const node = $getNodeByKey(nodeKey);
  if ($isRubyNode(node)) node.setReading(reading);
}
