import type { LexicalNode, RangeSelection } from 'lexical';
import { $createTextNode, $getSelection, $isRangeSelection } from 'lexical';

import { $createSpoilerNode, $isSpoilerNode, type SpoilerNode } from '../nodes/SpoilerNode';

function findSpoilerAncestor(node: LexicalNode | null | undefined): SpoilerNode | null {
  let current: LexicalNode | null | undefined = node;
  while (current) {
    if ($isSpoilerNode(current)) {
      return current;
    }
    current = current.getParent();
  }
  return null;
}

function getSpoilerNodesInSelection(nodes: ReturnType<RangeSelection['getNodes']>): SpoilerNode[] {
  const spoilers = new Map<string, SpoilerNode>();
  for (const node of nodes) {
    const spoiler = findSpoilerAncestor(node);
    if (spoiler) {
      spoilers.set(spoiler.getKey(), spoiler);
    }
  }
  return Array.from(spoilers.values());
}

export function $selectionTouchesSpoiler(selection: RangeSelection): boolean {
  return getSpoilerNodesInSelection(selection.getNodes()).length > 0;
}

function unwrapSpoiler(spoiler: SpoilerNode): void {
  const children = spoiler.getChildren();
  for (const child of children) {
    spoiler.insertBefore(child);
  }
  spoiler.remove();
}

/**
 * Toggle inline spoiler on the current selection: wraps plain text in {@link SpoilerNode},
 * or removes spoiler when the selection touches existing spoiler content.
 */
export function $toggleSpoilerSelection(): void {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  if (selection.isCollapsed()) {
    const spoiler = findSpoilerAncestor(selection.anchor.getNode());
    if (spoiler) {
      unwrapSpoiler(spoiler);
    }
    return;
  }

  const spoilerNodes = getSpoilerNodesInSelection(selection.getNodes());
  if (spoilerNodes.length > 0) {
    for (const spoiler of spoilerNodes) {
      unwrapSpoiler(spoiler);
    }
    return;
  }

  const text = selection.getTextContent();
  if (!text.trim()) return;

  selection.removeText();
  const spoiler = $createSpoilerNode();
  spoiler.append($createTextNode(text));
  const freshSelection = $getSelection();
  if ($isRangeSelection(freshSelection)) {
    freshSelection.insertNodes([spoiler]);
  }
}
