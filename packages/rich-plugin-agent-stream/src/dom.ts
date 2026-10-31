import { $getNodeByKey, $isElementNode, type LexicalEditor, type NodeKey } from 'lexical';

import type { QueueCaret } from './queue';
import * as styles from './styles.css';

export interface CaretRect {
  height: number;
  left: number;
  top: number;
}

const BLOCK_CARET_HEIGHT = 22;

export const supportsHighlights = () =>
  typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && !!CSS.highlights;

const firstTextNode = (element: HTMLElement | null) =>
  element
    ? (document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode() as Text | null)
    : null;

export function textRange(
  editor: LexicalEditor,
  blockKey: NodeKey,
  start: number,
  end: number,
): Range | null {
  return editor.getEditorState().read(() => {
    const block = $getNodeByKey(blockKey);
    if (!$isElementNode(block)) return null;
    const range = document.createRange();
    let offset = 0;
    let started = false;
    for (const node of block.getAllTextNodes()) {
      const size = node.getTextContentSize();
      const dom = firstTextNode(editor.getElementByKey(node.getKey()));
      if (!started && start <= offset + size) {
        if (!dom) return null;
        range.setStart(dom, Math.min(start - offset, dom.length));
        started = true;
      }
      if (started && end <= offset + size) {
        if (!dom) return null;
        range.setEnd(dom, Math.min(end - offset, dom.length));
        return range;
      }
      offset += size;
    }
    return null;
  });
}

const lastRect = (range: Range | null) => {
  const rects = range?.getClientRects?.();
  return rects ? (Array.from(rects).at(-1) ?? null) : null;
};

export function caretRect(editor: LexicalEditor, caret: QueueCaret): CaretRect | null {
  if (caret.kind === 'block') {
    const box = editor.getElementByKey(caret.blockKey)?.getBoundingClientRect();
    return box
      ? { left: box.left, top: box.bottom - BLOCK_CARET_HEIGHT, height: BLOCK_CARET_HEIGHT }
      : null;
  }
  if (caret.offset > 0) {
    const rect = lastRect(textRange(editor, caret.blockKey, caret.offset - 1, caret.offset));
    if (rect) return { left: rect.right, top: rect.top, height: rect.height };
  }
  const rect = textRange(
    editor,
    caret.blockKey,
    caret.offset,
    caret.offset + 1,
  )?.getClientRects?.()[0];
  return rect ? { left: rect.left, top: rect.top, height: rect.height } : null;
}

const owners = new Map<string, Map<object, Range[]>>();

export function publishRanges(owner: object, name: string, ranges: Range[]): void {
  const byOwner = owners.get(name) ?? new Map<object, Range[]>();
  owners.set(name, byOwner);
  if (ranges.length > 0) byOwner.set(owner, ranges);
  else byOwner.delete(owner);
  const all = [...byOwner.values()].flat();
  if (all.length > 0) CSS.highlights.set(name, new Highlight(...all));
  else CSS.highlights.delete(name);
}

export function clearRanges(owner: object): void {
  for (const name of owners.keys()) publishRanges(owner, name, []);
}

export function createCaretElement(): {
  element: HTMLDivElement;
  hide: () => void;
  place: (rect: CaretRect, host: HTMLElement) => void;
  setName: (name: string) => void;
} {
  const element = document.createElement('div');
  element.className = styles.caret;
  element.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = styles.caretLabel;
  element.append(label);
  return {
    element,
    setName: (name) => {
      label.textContent = name;
    },
    hide: () => element.classList.remove(styles.caretVisible),
    place: (rect, host) => {
      if (element.parentElement !== host) host.append(element);
      const origin = (element.offsetParent as HTMLElement | null) ?? document.body;
      const base = origin.getBoundingClientRect();
      const left = rect.left - base.left - origin.clientLeft + origin.scrollLeft;
      const top = rect.top - base.top - origin.clientTop + origin.scrollTop;
      element.style.transform = `translate(${left}px, ${top}px)`;
      element.style.height = `${rect.height}px`;
      element.classList.add(styles.caretVisible);
    },
  };
}

export function findScrollContainer(element: HTMLElement): HTMLElement {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}
