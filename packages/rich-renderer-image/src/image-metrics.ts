import {
  type ImageDisplayConvertContext,
  imageDisplayCssVars,
  type ImageDisplaySize,
} from '@haklex/rich-editor/nodes';

import { semanticClassNames } from './styles.css';

export function measureImageContainerWidth(trigger: HTMLElement): number | undefined {
  const blockWrapper = trigger.closest<HTMLElement>('.rich-image-wrapper');
  const container = blockWrapper?.parentElement ?? trigger.parentElement;
  if (!container) return undefined;
  const style = getComputedStyle(container);
  const width =
    container.clientWidth -
    Number.parseFloat(style.paddingLeft) -
    Number.parseFloat(style.paddingRight);
  return width > 0 ? width : undefined;
}

export function readImageDisplayContext(
  trigger: HTMLElement | null,
  intrinsicWidth?: number,
  intrinsicHeight?: number,
): ImageDisplayConvertContext | undefined {
  if (!trigger) return undefined;
  const containerWidth = measureImageContainerWidth(trigger);
  if (!containerWidth) return undefined;
  const frame = trigger.querySelector<HTMLElement>(`.${semanticClassNames.frame}`);
  const rect = frame?.getBoundingClientRect();
  return {
    containerWidth,
    intrinsicWidth,
    intrinsicHeight,
    renderedWidth: rect?.width,
    renderedHeight: rect?.height,
  };
}

export function applyImageSizePreview(
  trigger: HTMLElement,
  layout: string | undefined,
  next: ImageDisplaySize,
) {
  const figure = trigger.querySelector<HTMLElement>('figure');
  const isFloat = layout === 'float-left' || layout === 'float-right';
  const blockWrapper = trigger.closest<HTMLElement>('.rich-image-wrapper');
  figure?.style.removeProperty('--rich-image-display-width');
  figure?.style.removeProperty('--rich-image-display-height');
  const vars = imageDisplayCssVars(next);
  if (figure && vars) {
    for (const [key, value] of Object.entries(vars)) {
      figure.style.setProperty(key, value);
    }
  }
  if (!isFloat || !blockWrapper) return;
  if (next.mode === 'percent') {
    blockWrapper.style.width = `${next.value}%`;
    blockWrapper.style.maxWidth = '';
    return;
  }
  if (next.mode === 'fixed-width') {
    blockWrapper.style.width = `${next.px}px`;
    blockWrapper.style.maxWidth = '100%';
    return;
  }
  if (next.mode === 'fixed-height') {
    blockWrapper.style.width = 'auto';
    blockWrapper.style.maxWidth = '100%';
    return;
  }
  blockWrapper.style.width = '';
  blockWrapper.style.maxWidth = '';
}
