import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import {
  $getRoot,
  $isElementNode,
  $isParagraphNode,
  type EditorState,
  type LexicalNode,
  type NodeKey,
} from 'lexical';

export type RevealSegment =
  | { kind: 'text'; blockKey: NodeKey; from: number; to: number; text: string }
  | { kind: 'block'; blockKey: NodeKey };

interface BlockSnapshot {
  isText: boolean;
  text: string;
}

export const $isRevealTextBlock = (node: LexicalNode | null): boolean =>
  $isParagraphNode(node) || $isHeadingNode(node) || $isQuoteNode(node);

export const $revealText = (node: LexicalNode | null): string =>
  $isElementNode(node)
    ? node
        .getAllTextNodes()
        .map((text) => text.getTextContent())
        .join('')
    : '';

function snapshot(state: EditorState): Map<NodeKey, BlockSnapshot> {
  return state.read(() => {
    const blocks = new Map<NodeKey, BlockSnapshot>();
    for (const child of $getRoot().getChildren()) {
      blocks.set(child.getKey(), { isText: $isRevealTextBlock(child), text: $revealText(child) });
    }
    return blocks;
  });
}

function changedSpan(before: string, after: string): { from: number; to: number } {
  const limit = Math.min(before.length, after.length);
  let prefix = 0;
  while (prefix < limit && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < limit - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix++;
  }
  return { from: prefix, to: after.length - suffix };
}

export function planReveal(prev: EditorState, next: EditorState): RevealSegment[] {
  const before = snapshot(prev);
  return next.read(() => {
    const segments: RevealSegment[] = [];
    for (const child of $getRoot().getChildren()) {
      const blockKey = child.getKey();
      const old = before.get(blockKey);
      if (!$isRevealTextBlock(child)) {
        if (!old) segments.push({ kind: 'block', blockKey });
        continue;
      }
      const text = $revealText(child);
      const base = old?.isText ? old.text : '';
      if (text === base) continue;
      const { from, to } = changedSpan(base, text);
      if (to > from) segments.push({ kind: 'text', blockKey, from, to, text });
    }
    return segments;
  });
}
