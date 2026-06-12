import type { AnnotationState } from '@markerjs/markerjs3';

import { offsetMarkerState } from './annotation';
import { buildResult } from './build-result';
import type { CropRect } from './crop';
import { canvasToObjectUrl, cropCanvas, extractCrop, sourceToCanvas } from './crop';
import { rasterizeAnnotations } from './rasterize';

export interface CropRebase {
  bitmapUrl: string;
  markerState: AnnotationState | null;
}

export async function applyCropRebase(
  sourceUrl: string,
  rect: CropRect,
  markerState: AnnotationState | null,
): Promise<CropRebase> {
  const canvas = await extractCrop(sourceUrl, rect);
  const bitmapUrl = await canvasToObjectUrl(canvas);
  return {
    bitmapUrl,
    markerState: markerState
      ? {
          ...offsetMarkerState(markerState, -rect.x, -rect.y),
          height: rect.height,
          width: rect.width,
        }
      : null,
  };
}

export interface ExportInput {
  hasRebasedBitmap: boolean;
  markerState: AnnotationState | null;
  original: File;
  pendingCropRect: CropRect | null;
  sourceUrl: string;
}

export async function exportResult({
  hasRebasedBitmap,
  markerState,
  original,
  pendingCropRect,
  sourceUrl,
}: ExportInput): Promise<File> {
  const hasMarkers = markerState !== null && markerState.markers.length > 0;

  let canvas: HTMLCanvasElement | null = null;
  if (hasMarkers && markerState) {
    canvas = await rasterizeAnnotations(sourceUrl, markerState);
    if (pendingCropRect) canvas = cropCanvas(canvas, pendingCropRect);
  } else if (pendingCropRect) {
    canvas = await extractCrop(sourceUrl, pendingCropRect);
  } else if (hasRebasedBitmap) {
    canvas = await sourceToCanvas(sourceUrl);
  }
  return buildResult(original, canvas);
}
