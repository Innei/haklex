import type { ImageLayout } from '@haklex/rich-editor/nodes';
import type { LexicalEditor } from 'lexical';

export const IMAGE_DRAG_DATA_KEY = 'application/x-haklex-image-drag';

export type ImageDropSide = 'left' | 'right';

type HorizontalRect = Pick<DOMRect, 'left' | 'width'>;

export function getImageDropSide(rootRect: HorizontalRect, clientX: number): ImageDropSide {
  return clientX < rootRect.left + rootRect.width / 2 ? 'left' : 'right';
}

export function getImageDropLayout(
  side: ImageDropSide,
): Extract<ImageLayout, 'float-left' | 'float-right'> {
  return side === 'left' ? 'float-left' : 'float-right';
}

export function isImageDragData(dataTransfer: DataTransfer | null | undefined): boolean {
  return Boolean(dataTransfer?.types.includes(IMAGE_DRAG_DATA_KEY));
}

function getBlockElement(editor: LexicalEditor, target: HTMLElement): HTMLElement | null {
  const rootElement = editor.getRootElement();
  if (!rootElement) return null;

  let current: HTMLElement | null = target;
  while (current && current !== rootElement) {
    if (current.parentElement === rootElement) return current;
    current = current.parentElement;
  }

  return null;
}

function getNearestBlockByY(rootElement: HTMLElement, clientY: number): HTMLElement | null {
  const blocks = [...rootElement.children].filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  if (!blocks.length) return null;

  let nearestBlock: HTMLElement | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const block of blocks) {
    const rect = block.getBoundingClientRect();
    if (rect.height <= 0) continue;
    if (clientY >= rect.top && clientY <= rect.bottom) return block;

    const distance = clientY < rect.top ? rect.top - clientY : clientY - rect.bottom;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestBlock = block;
    }
  }

  return nearestBlock;
}

export function getImageDropTargetBlock(
  editor: LexicalEditor,
  rootElement: HTMLElement,
  event: DragEvent,
): HTMLElement | null {
  const rootRect = rootElement.getBoundingClientRect();
  if (rootRect.width <= 0 || rootRect.height <= 0) return null;
  if (event.clientY < rootRect.top || event.clientY > rootRect.bottom) return null;

  const points: Array<{ x: number; y: number }> = [{ x: event.clientX, y: event.clientY }];
  const clampedX = Math.min(rootRect.right - 1, Math.max(rootRect.left + 1, event.clientX));
  if (clampedX !== event.clientX) points.unshift({ x: clampedX, y: event.clientY });

  for (const point of points) {
    const element = document.elementFromPoint(point.x, point.y);
    if (!(element instanceof HTMLElement)) continue;
    const block = getBlockElement(editor, element);
    if (block) return block;
  }

  if (event.target instanceof HTMLElement) {
    const block = getBlockElement(editor, event.target);
    if (block) return block;
  }

  return getNearestBlockByY(rootElement, event.clientY);
}
