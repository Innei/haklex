import type { AnnotationState, IPoint, MarkerBaseState } from '@markerjs/markerjs3';

import type { EditorTool } from './useImageEditorState';

export type AnnotationTool = Exclude<EditorTool, 'crop'>;

// markerjs3 has no numbered-badge marker, so Counter is a TextMarker preset
// prefilled with an auto-incrementing number.
export const MARKER_TYPE_BY_TOOL: Record<AnnotationTool, string> = {
  arrow: 'ArrowMarker',
  counter: 'TextMarker',
  cover: 'CoverMarker',
  ellipse: 'EllipseFrameMarker',
  pen: 'FreehandMarker',
  rect: 'FrameMarker',
  text: 'TextMarker',
};

export function isAnnotationTool(tool: EditorTool): tool is AnnotationTool {
  return tool !== 'crop';
}

export const SWATCH_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#171717',
  '#ffffff',
] as const;

export const STROKE_WIDTHS = [2, 4, 6] as const;

export const STROKE_TOOLS: ReadonlySet<AnnotationTool> = new Set([
  'arrow',
  'ellipse',
  'pen',
  'rect',
]);

interface TranslatableMarkerState extends MarkerBaseState {
  left?: number;
  points?: IPoint[];
  top?: number;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
}

function offsetMarker(marker: MarkerBaseState, dx: number, dy: number): MarkerBaseState {
  const next: TranslatableMarkerState = { ...marker };
  if (typeof next.left === 'number') next.left += dx;
  if (typeof next.top === 'number') next.top += dy;
  if (typeof next.x1 === 'number') next.x1 += dx;
  if (typeof next.y1 === 'number') next.y1 += dy;
  if (typeof next.x2 === 'number') next.x2 += dx;
  if (typeof next.y2 === 'number') next.y2 += dy;
  if (Array.isArray(next.points)) {
    next.points = next.points.map((point) => ({ x: point.x + dx, y: point.y + dy }));
  }
  return next;
}

export function offsetMarkerState(state: AnnotationState, dx: number, dy: number): AnnotationState {
  return {
    ...state,
    markers: state.markers.map((marker) => offsetMarker(marker, dx, dy)),
  };
}
