export const INLINE_DRAG_ATTR = 'data-inline-drag';

export const INLINE_DRAG_MIME = 'application/x-haklex-inline-node';

export function markInlineDraggable(el: HTMLElement, nodeKey: string): void {
  el.draggable = true;
  el.setAttribute(INLINE_DRAG_ATTR, nodeKey);
}
