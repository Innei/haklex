import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createRangeSelection, $getNodeByKey, $setSelection } from 'lexical';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import * as css from './inline-dnd.css';
import { INLINE_DRAG_ATTR, INLINE_DRAG_MIME } from './inline-dnd-shared';

interface CaretState {
  height: number;
  left: number;
  top: number;
}

function caretRangeAtPoint(x: number, y: number): Range | null {
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(x, y);
  }
  const position = document.caretPositionFromPoint?.(x, y);
  if (!position) return null;
  const range = document.createRange();
  range.setStart(position.offsetNode, position.offset);
  range.collapse(true);
  return range;
}

function snapRangeToNearestBlock(root: HTMLElement, y: number): Range | null {
  let nearest: { el: Element; distance: number; below: boolean } | null = null;
  for (const el of root.children) {
    const rect = el.getBoundingClientRect();
    if (rect.height === 0) continue;
    const distance = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
    const below = y > (rect.top + rect.bottom) / 2;
    if (!nearest || distance < nearest.distance) {
      nearest = { el, distance, below };
    }
  }
  if (!nearest) return null;
  const range = document.createRange();
  range.selectNodeContents(nearest.el);
  range.collapse(!nearest.below);
  return range;
}

function resolveDropRange(root: HTMLElement, event: DragEvent): Range | null {
  const range = caretRangeAtPoint(event.clientX, event.clientY);
  if (range && root.contains(range.startContainer)) return range;
  return snapRangeToNearestBlock(root, event.clientY);
}

function caretRect(range: Range): DOMRect | null {
  const rects = range.getClientRects();
  if (rects.length > 0) return rects[0];
  const rect = range.getBoundingClientRect();
  if (rect.height > 0) return rect;
  const container = range.startContainer;
  const el = container instanceof Element ? container : container.parentElement;
  return el ? el.getBoundingClientRect() : null;
}

export function InlineDndPlugin() {
  const [editor] = useLexicalComposerContext();
  const [caret, setCaret] = useState<CaretState | null>(null);

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    let draggedKey: string | null = null;
    let sourceEl: HTMLElement | null = null;

    const clear = () => {
      draggedKey = null;
      sourceEl?.classList.remove(css.draggingSource);
      sourceEl = null;
      setCaret(null);
    };

    const onDragStart = (event: DragEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.(`[${INLINE_DRAG_ATTR}]`);
      if (!(target instanceof HTMLElement) || !event.dataTransfer) return;
      const nodeKey = target.getAttribute(INLINE_DRAG_ATTR);
      if (!nodeKey) return;

      draggedKey = nodeKey;
      sourceEl = target;
      event.dataTransfer.setData(INLINE_DRAG_MIME, nodeKey);
      event.dataTransfer.setData('text/plain', target.textContent ?? '');
      event.dataTransfer.effectAllowed = 'move';
      requestAnimationFrame(() => sourceEl?.classList.add(css.draggingSource));
    };

    const onDragOver = (event: DragEvent) => {
      if (!draggedKey && !event.dataTransfer?.types.includes(INLINE_DRAG_MIME)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

      const range = resolveDropRange(root, event);
      const rect = range && caretRect(range);
      if (!rect) {
        setCaret(null);
        return;
      }
      setCaret({ left: rect.left, top: rect.top, height: rect.height || 20 });
    };

    const onDrop = (event: DragEvent) => {
      const nodeKey = draggedKey ?? event.dataTransfer?.getData(INLINE_DRAG_MIME);
      if (!nodeKey) return;
      event.preventDefault();
      event.stopPropagation();

      const range = resolveDropRange(root, event);
      if (range) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (!node) return;
          node.remove();
          const selection = $createRangeSelection();
          selection.applyDOMRange(range);
          $setSelection(selection);
          selection.insertNodes([node]);
        });
      }
      clear();
    };

    const onDragEnd = () => clear();

    const onDragLeave = (event: DragEvent) => {
      if (!root.contains(event.relatedTarget as Node | null)) setCaret(null);
    };

    root.addEventListener('dragstart', onDragStart);
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('drop', onDrop);
    root.addEventListener('dragend', onDragEnd);
    root.addEventListener('dragleave', onDragLeave);

    return () => {
      clear();
      root.removeEventListener('dragstart', onDragStart);
      root.removeEventListener('dragover', onDragOver);
      root.removeEventListener('drop', onDrop);
      root.removeEventListener('dragend', onDragEnd);
      root.removeEventListener('dragleave', onDragLeave);
    };
  }, [editor]);

  if (!caret) return null;

  return createPortal(
    <div
      className={css.dropCaret}
      style={{ left: caret.left, top: caret.top, height: caret.height }}
    />,
    document.body,
  );
}
