import type { ElementType, ExcalidrawElement } from '../scene/types';

export const SHADOW_TYPES: ReadonlySet<ElementType> = new Set<ElementType>([
  'rectangle',
  'diamond',
  'ellipse',
  'image',
  'svg',
]);

export const supportsShadow = (type: ElementType): boolean => SHADOW_TYPES.has(type);

export const hasShadow = (el: ExcalidrawElement): boolean =>
  el.shadow === true && supportsShadow(el.type);
