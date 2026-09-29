import type { ImageSize } from './resize';

export interface EditSummaryInput {
  cropped: boolean;
  marks: number;
  mosaics: number;
  resizedTo: ImageSize | null;
}

export function buildEditSummary({ cropped, marks, mosaics, resizedTo }: EditSummaryInput): string {
  const parts: string[] = [];
  if (cropped) parts.push('Cropped');
  if (marks > 0) parts.push(`${marks} mark${marks > 1 ? 's' : ''}`);
  if (mosaics > 0) parts.push(`${mosaics} mosaic`);
  if (resizedTo) parts.push(`${resizedTo.width} × ${resizedTo.height}`);
  return parts.join(' · ');
}
