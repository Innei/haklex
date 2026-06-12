import type { AnnotationState } from '@markerjs/markerjs3';
import { Renderer } from '@markerjs/markerjs3';

import { loadImage } from './crop';

export async function rasterizeAnnotations(
  imageSrc: string,
  state: AnnotationState,
): Promise<HTMLCanvasElement> {
  const image = await loadImage(imageSrc);
  const renderer = new Renderer();
  renderer.targetImage = image;
  renderer.naturalSize = true;
  const canvas = document.createElement('canvas');
  await renderer.rasterize(state, canvas);
  return canvas;
}
