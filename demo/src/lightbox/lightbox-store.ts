import type { ImageClickPayload } from '@haklex/rich-compose';

type LightboxListener = (payload: ImageClickPayload) => void;

let listener: LightboxListener | null = null;

export function onImageClick(payload: ImageClickPayload): void {
  listener?.(payload);
}

export function subscribeLightbox(next: LightboxListener): () => void {
  listener = next;
  return () => {
    if (listener === next) listener = null;
  };
}
