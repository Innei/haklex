import { $selectionTouchesSpoiler } from '@haklex/rich-editor/commands';
import { $isKaTeXInlineNode, $isRubyNode, type KaTeXInlineNode } from '@haklex/rich-editor/nodes';
import type { AutoLinkNode } from '@lexical/link';
import { $isAutoLinkNode, $isLinkNode } from '@lexical/link';
import { $getSelectionStyleValueForProperty } from '@lexical/selection';
import type { LexicalNode, RangeSelection } from 'lexical';

export interface ToolbarState {
  backgroundColor: string;
  fontColor: string;
  isBold: boolean;
  isCode: boolean;
  isHighlight: boolean;
  isItalic: boolean;
  isLink: boolean;
  isRuby: boolean;
  isSpoiler: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
}

export const INITIAL_STATE: ToolbarState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isSuperscript: false,
  isSubscript: false,
  isCode: false,
  isHighlight: false,
  isLink: false,
  isRuby: false,
  isSpoiler: false,
  fontColor: '',
  backgroundColor: '',
};

export function isEffectiveLinkNode(node: LexicalNode | null | undefined): boolean {
  if (!$isLinkNode(node)) return false;
  return !$isAutoLinkNode(node) || !node.getIsUnlinked();
}

export function isRegularLinkNode(node: LexicalNode | null | undefined): boolean {
  return $isLinkNode(node) && !$isAutoLinkNode(node);
}

export function $selectionHasLink(selection: RangeSelection): boolean {
  return selection.getNodes().some((node) => {
    const parent = node.getParent();
    return isEffectiveLinkNode(parent) || isEffectiveLinkNode(node);
  });
}

export function $getSelectedLinkUrl(selection: RangeSelection): string {
  let current: LexicalNode | null = selection.anchor.getNode();
  while (current) {
    if ($isLinkNode(current)) return current.getURL();
    current = current.getParent();
  }
  return '';
}

export function collectSelectedActiveAutoLinkNodes(selection: RangeSelection): AutoLinkNode[] {
  const autoLinkNodes = new Map<string, AutoLinkNode>();

  for (const node of selection.getNodes()) {
    if ($isAutoLinkNode(node) && !node.getIsUnlinked()) {
      autoLinkNodes.set(node.getKey(), node);
    }

    const parent = node.getParent();
    if ($isAutoLinkNode(parent) && !parent.getIsUnlinked()) {
      autoLinkNodes.set(parent.getKey(), parent);
    }
  }

  return Array.from(autoLinkNodes.values());
}

export function findRubyAncestor(node: LexicalNode | null | undefined) {
  let current: LexicalNode | null | undefined = node;
  while (current) {
    if ($isRubyNode(current)) {
      return current;
    }
    current = current.getParent();
  }
  return null;
}

export function getSelectedRubyNodes(nodes: LexicalNode[]) {
  const rubyNodes = new Map<string, NonNullable<ReturnType<typeof findRubyAncestor>>>();

  for (const node of nodes) {
    const rubyNode = findRubyAncestor(node);
    if (rubyNode) {
      rubyNodes.set(rubyNode.getKey(), rubyNode);
    }
  }

  return Array.from(rubyNodes.values());
}

export function getSelectionState(selection: RangeSelection): ToolbarState {
  const nodes = selection.getNodes();
  let fontColor = $getSelectionStyleValueForProperty(selection, 'color', '');
  if (!fontColor) {
    const katex = nodes.find((n): n is KaTeXInlineNode => $isKaTeXInlineNode(n));
    if (katex) fontColor = katex.getColor() ?? '';
  }

  return {
    isBold: selection.hasFormat('bold'),
    isItalic: selection.hasFormat('italic'),
    isUnderline: selection.hasFormat('underline'),
    isStrikethrough: selection.hasFormat('strikethrough'),
    isSuperscript: selection.hasFormat('superscript'),
    isSubscript: selection.hasFormat('subscript'),
    isCode: selection.hasFormat('code'),
    isHighlight: selection.hasFormat('highlight'),
    isLink: $selectionHasLink(selection),
    isRuby: getSelectedRubyNodes(nodes).length > 0,
    isSpoiler: $selectionTouchesSpoiler(selection),
    fontColor,
    backgroundColor: $getSelectionStyleValueForProperty(selection, 'background-color', ''),
  };
}
