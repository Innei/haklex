import type { ElementNode, LexicalNode, RangeSelection } from 'lexical';
import {
  $createRangeSelection,
  $getRoot,
  $getSelection,
  $getState,
  $isElementNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
} from 'lexical';

import { blockIdState } from '../plugins/BlockIdPlugin';
import { $getRootBlock, $getTextOffsetInBlock, $resolveSelectionPoint } from './comment-anchor';

export { TEXT_SELECTION_HIGHLIGHT_NAME } from './text-selection-constants';

export interface TextSelectionSnapshot {
  anchorBlockId: string;
  anchorOffset: number;
  focusBlockId: string;
  focusOffset: number;
  text: string;
}

interface LexicalSelectionTarget {
  key: string;
  offset: number;
  type: 'element' | 'text';
}

export interface DOMSelectionTarget {
  node: Node;
  offset: number;
}

function clampOffset(offset: number, max: number): number {
  return Math.max(0, Math.min(offset, max));
}

function getTopLevelBlockById(blockId: string): ElementNode | null {
  for (const child of $getRoot().getChildren()) {
    if ($getState(child, blockIdState) === blockId && $isElementNode(child)) {
      return child;
    }
  }
  return null;
}

function getTextLengthOfDomNode(node: Node): number {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.length ?? 0;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return 0;
  }

  const element = node as Element;
  if (element.tagName === 'BR') {
    return 1;
  }

  let length = 0;
  for (const child of node.childNodes) {
    length += getTextLengthOfDomNode(child);
  }
  return length;
}

function compareBlockElements(a: HTMLElement, b: HTMLElement): number {
  if (a === b) return 0;

  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  }
  if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return 1;
  }
  return 0;
}

function buildDomRectFromClientRects(rects: DOMRect[]): DOMRect | null {
  if (!rects.length) return null;

  let left = rects[0].left;
  let top = rects[0].top;
  let right = rects[0].right;
  let bottom = rects[0].bottom;

  for (const rect of rects.slice(1)) {
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }

  return new DOMRect(left, top, right - left, bottom - top);
}

function resolveLexicalSelectionTarget(
  block: ElementNode,
  requestedOffset: number,
): LexicalSelectionTarget {
  const offset = clampOffset(requestedOffset, block.getTextContent().length);
  let remaining = offset;
  let lastTarget: LexicalSelectionTarget = {
    key: block.getKey(),
    offset: block.getChildrenSize(),
    type: 'element',
  };

  function walk(node: LexicalNode): LexicalSelectionTarget | null {
    if ($isTextNode(node)) {
      const length = node.getTextContentSize();
      lastTarget = { key: node.getKey(), offset: length, type: 'text' };

      if (remaining <= length) {
        return { key: node.getKey(), offset: remaining, type: 'text' };
      }

      remaining -= length;
      return null;
    }

    if ($isLineBreakNode(node)) {
      const parent = node.getParent();
      if (!parent) {
        return null;
      }

      const index = node.getIndexWithinParent();
      if (remaining === 0) {
        return { key: parent.getKey(), offset: index, type: 'element' };
      }
      if (remaining === 1) {
        return { key: parent.getKey(), offset: index + 1, type: 'element' };
      }

      remaining -= 1;
      lastTarget = { key: parent.getKey(), offset: index + 1, type: 'element' };
      return null;
    }

    if (!$isElementNode(node)) {
      return null;
    }

    if (node.getChildrenSize() === 0) {
      lastTarget = { key: node.getKey(), offset: 0, type: 'element' };
      return null;
    }

    for (const child of node.getChildren()) {
      const resolved = walk(child);
      if (resolved) {
        return resolved;
      }
    }

    lastTarget = { key: node.getKey(), offset: node.getChildrenSize(), type: 'element' };
    return null;
  }

  return walk(block) ?? lastTarget;
}

export function $captureTextSelectionFromRangeSelection(
  selection: RangeSelection,
): TextSelectionSnapshot | null {
  if (selection.isCollapsed()) {
    return null;
  }

  const anchorBlock = $getRootBlock(selection.anchor.getNode());
  const focusBlock = $getRootBlock(selection.focus.getNode());
  if (!anchorBlock || !focusBlock) {
    return null;
  }

  const anchorBlockId = $getState(anchorBlock, blockIdState);
  const focusBlockId = $getState(focusBlock, blockIdState);
  if (!anchorBlockId || !focusBlockId) {
    return null;
  }

  const anchorPoint = $resolveSelectionPoint(selection, 'anchor');
  const focusPoint = $resolveSelectionPoint(selection, 'focus');

  return {
    text: selection.getTextContent(),
    anchorBlockId,
    anchorOffset: $getTextOffsetInBlock(anchorBlock, anchorPoint.node, anchorPoint.offset),
    focusBlockId,
    focusOffset: $getTextOffsetInBlock(focusBlock, focusPoint.node, focusPoint.offset),
  };
}

export function $captureTextSelection(): TextSelectionSnapshot | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return null;
  }

  return $captureTextSelectionFromRangeSelection(selection);
}

export function $restoreTextSelection(snapshot: TextSelectionSnapshot): boolean {
  const anchorBlock = getTopLevelBlockById(snapshot.anchorBlockId);
  const focusBlock = getTopLevelBlockById(snapshot.focusBlockId);
  if (!anchorBlock || !focusBlock) {
    return false;
  }

  const anchor = resolveLexicalSelectionTarget(anchorBlock, snapshot.anchorOffset);
  const focus = resolveLexicalSelectionTarget(focusBlock, snapshot.focusOffset);

  const selection = $createRangeSelection();
  selection.anchor.set(anchor.key, anchor.offset, anchor.type);
  selection.focus.set(focus.key, focus.offset, focus.type);
  $setSelection(selection);
  return true;
}

export function getTextOffsetFromDOMPoint(
  container: Element,
  targetNode: Node,
  targetOffset: number,
): number {
  let offset = 0;

  function walk(node: Node): boolean {
    if (node === targetNode) {
      if (node.nodeType === Node.TEXT_NODE) {
        offset += Math.min(targetOffset, node.textContent?.length ?? 0);
        return true;
      }

      const childNodes = Array.from(node.childNodes);
      const boundary = Math.min(targetOffset, childNodes.length);
      for (let i = 0; i < boundary; i++) {
        offset += getTextLengthOfDomNode(childNodes[i]);
      }
      return true;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      offset += node.textContent?.length ?? 0;
      return false;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    const element = node as Element;
    if (element.tagName === 'BR') {
      offset += 1;
      return false;
    }

    for (const child of node.childNodes) {
      if (walk(child)) {
        return true;
      }
    }

    return false;
  }

  walk(container);
  return offset;
}

export function findDOMPointByTextOffset(
  container: Element,
  requestedOffset: number,
): DOMSelectionTarget | null {
  const targetOffset = clampOffset(requestedOffset, getTextLengthOfDomNode(container));
  let consumed = 0;

  function walk(node: Node): DOMSelectionTarget | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.textContent?.length ?? 0;
      if (targetOffset <= consumed + length) {
        return { node, offset: targetOffset - consumed };
      }

      consumed += length;
      return null;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = node as Element;
    if (element.tagName === 'BR') {
      const parent = element.parentNode;
      if (!parent) {
        return null;
      }

      const index = Array.from(parent.childNodes).indexOf(element);
      if (targetOffset === consumed) {
        return { node: parent, offset: index };
      }
      if (targetOffset === consumed + 1) {
        return { node: parent, offset: index + 1 };
      }

      consumed += 1;
      return null;
    }

    for (const child of node.childNodes) {
      const resolved = walk(child);
      if (resolved) {
        return resolved;
      }
    }

    return null;
  }

  return walk(container) ?? { node: container, offset: container.childNodes.length };
}

export function getBlockElementById(rootElement: HTMLElement, blockId: string): HTMLElement | null {
  return rootElement.querySelector(`[data-block-id="${blockId}"]`);
}

export function createDOMRangeFromTextSelection(
  rootElement: HTMLElement,
  snapshot: TextSelectionSnapshot,
): Range | null {
  const anchorBlock = getBlockElementById(rootElement, snapshot.anchorBlockId);
  const focusBlock = getBlockElementById(rootElement, snapshot.focusBlockId);
  if (!anchorBlock || !focusBlock) {
    return null;
  }

  const anchor = findDOMPointByTextOffset(anchorBlock, snapshot.anchorOffset);
  const focus = findDOMPointByTextOffset(focusBlock, snapshot.focusOffset);
  if (!anchor || !focus) {
    return null;
  }

  const anchorComesFirst =
    anchorBlock === focusBlock
      ? snapshot.anchorOffset <= snapshot.focusOffset
      : compareBlockElements(anchorBlock, focusBlock) <= 0;

  const start = anchorComesFirst ? anchor : focus;
  const end = anchorComesFirst ? focus : anchor;

  try {
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    return range;
  } catch {
    return null;
  }
}

export function getDOMRectFromTextSelection(
  rootElement: HTMLElement,
  snapshot: TextSelectionSnapshot,
): DOMRect | null {
  const range = createDOMRangeFromTextSelection(rootElement, snapshot);
  if (!range) {
    return null;
  }

  const rect = range.getBoundingClientRect();
  if (rect.width > 0 || rect.height > 0) {
    return rect;
  }

  return buildDomRectFromClientRects(Array.from(range.getClientRects()));
}
