import type { EditorVirtualizationOptions } from './types';

export function resolveScrollContainer(
  canvas: HTMLElement,
  configured: EditorVirtualizationOptions['scrollContainer'],
): HTMLElement | Window {
  const element =
    typeof configured === 'function'
      ? configured()
      : configured && 'current' in configured
        ? configured.current
        : configured;
  if (configured) {
    if (!element) throw new Error('Virtual scrollContainer is not mounted');
    if (!element.contains(canvas))
      throw new Error('Virtual scrollContainer must contain the content');
    return element;
  }
  for (let parent = canvas.parentElement; parent; parent = parent.parentElement)
    if (/auto|scroll/.test(getComputedStyle(parent).overflowY)) return parent;
  return window;
}
