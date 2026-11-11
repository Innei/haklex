import type { ExcalidrawElement } from '../scene/types';

const BINDABLE = new Set([
  'rectangle',
  'diamond',
  'ellipse',
  'image',
  'svg',
  'richtext',
  'text',
  'embeddable',
  'iframe',
]);

export function isBindable(el: ExcalidrawElement): boolean {
  if (el.isDeleted || !BINDABLE.has(el.type)) return false;
  return !(el.type === 'text' && el.containerId);
}
