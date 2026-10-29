import type { LexicalNode } from 'lexical';
import { $getRoot, $getSelection, $isElementNode, $isRangeSelection } from 'lexical';

function $topLevelKey(node: LexicalNode): string | null {
  return node.getTopLevelElement()?.getKey() ?? null;
}

export function $selectionBlockKeys(): string[] {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return [];
  const touched = new Set<string>();
  for (const node of [
    selection.anchor.getNode(),
    selection.focus.getNode(),
    ...selection.getNodes(),
  ]) {
    const key = $topLevelKey(node);
    if (key) touched.add(key);
  }
  return $getRoot()
    .getChildren()
    .map((child) => child.getKey())
    .filter((key) => touched.has(key));
}

export function $moveBlocks(keys: string[], direction: 'up' | 'down'): boolean {
  const keySet = new Set(keys);
  const blocks = $getRoot()
    .getChildren()
    .filter((child) => keySet.has(child.getKey()));
  if (blocks.length === 0) return false;

  const first = blocks[0];
  const last = blocks.at(-1)!;

  if (direction === 'up') {
    const previous = first.getPreviousSibling();
    if (!previous || keySet.has(previous.getKey())) return false;
    previous.remove();
    last.insertAfter(previous);
    return true;
  }

  const next = last.getNextSibling();
  if (!next || keySet.has(next.getKey())) return false;
  next.remove();
  first.insertBefore(next);
  return true;
}

function $cloneNode(node: LexicalNode): LexicalNode {
  const Klass = node.constructor as { importJSON: (json: unknown) => LexicalNode };
  const clone = Klass.importJSON(node.exportJSON());
  if ($isElementNode(node) && $isElementNode(clone)) {
    for (const child of node.getChildren()) {
      clone.append($cloneNode(child));
    }
  }
  return clone;
}

export function $duplicateBlocks(keys: string[]): boolean {
  const keySet = new Set(keys);
  const blocks = $getRoot()
    .getChildren()
    .filter((child) => keySet.has(child.getKey()));
  if (blocks.length === 0) return false;
  let insertAfter = blocks.at(-1)!;
  for (const block of blocks) {
    const clone = $cloneNode(block);
    insertAfter.insertAfter(clone);
    insertAfter = clone;
  }
  return true;
}
