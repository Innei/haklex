export interface Box {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface ToolbarPosition {
  left: number;
  placement: 'top' | 'bottom';
  top: number;
}

const GAP = 8;
const EDGE = 8;

export function computeToolbarPosition({
  anchor,
  size,
  bounds,
}: {
  anchor: Box;
  bounds: Box;
  size: { width: number; height: number };
}): ToolbarPosition {
  const above = anchor.top - GAP - size.height;
  const below = anchor.bottom + GAP;
  const fitsAbove = above >= bounds.top;
  const fitsBelow = below + size.height <= bounds.bottom;
  const placement = fitsAbove || !fitsBelow ? 'top' : 'bottom';
  const top = placement === 'top' ? Math.max(above, bounds.top) : below;

  const center = (anchor.left + anchor.right) / 2;
  const minLeft = bounds.left + EDGE;
  const maxLeft = bounds.right - size.width - EDGE;
  const left = Math.max(minLeft, Math.min(center - size.width / 2, maxLeft));

  return { top, left, placement };
}

function isPinned(el: Element) {
  const { position } = window.getComputedStyle(el);
  return position === 'sticky' || position === 'fixed';
}

export function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let current = el?.parentElement ?? null;
  while (current) {
    const { overflowY } = window.getComputedStyle(current);
    if (overflowY === 'auto' || overflowY === 'scroll') return current;
    current = current.parentElement;
  }
  return null;
}

export function getViewportBounds(
  rootElement: HTMLElement,
  own: HTMLElement | null,
  anchorTop: number,
): Box {
  const bounds: Box = {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  };

  const scrollParent = findScrollParent(rootElement);
  if (scrollParent) {
    const rect = scrollParent.getBoundingClientRect();
    bounds.top = Math.max(bounds.top, rect.top);
    bounds.bottom = Math.min(bounds.bottom, rect.bottom);
  }

  const rootRect = rootElement.getBoundingClientRect();
  for (const bar of document.querySelectorAll('[role="toolbar"]')) {
    if (bar === own || own?.contains(bar) || !isPinned(bar)) continue;
    const rect = bar.getBoundingClientRect();
    const overlaps = rect.right > rootRect.left && rect.left < rootRect.right;
    if (overlaps && rect.top < anchorTop && rect.bottom > bounds.top) {
      bounds.top = Math.min(rect.bottom, anchorTop);
    }
  }

  return bounds;
}
