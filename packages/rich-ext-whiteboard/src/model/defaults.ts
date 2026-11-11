import type { Arrowhead, FillStyle, FontFamilyId, StrokeStyle } from '../scene/types';

export type ArrowType = 'sharp' | 'round' | 'elbow';

export interface ElementStyle {
  arrowType: ArrowType;
  backgroundColor: string;
  endArrowhead: Arrowhead;
  fillStyle: FillStyle;
  fontFamily: FontFamilyId;
  fontSize: number;
  opacity: number;
  roughness: number;
  roundness: 'round' | 'sharp';
  startArrowhead: Arrowhead;
  strokeColor: string;
  strokeStyle: StrokeStyle;
  strokeWidth: number;
  textAlign: 'left' | 'center' | 'right';
}

export const DEFAULT_STYLE: ElementStyle = {
  strokeColor: '#1e1e1e',
  backgroundColor: 'transparent',
  fillStyle: 'hachure',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 1,
  opacity: 100,
  roundness: 'round',
  fontFamily: 5,
  fontSize: 20,
  textAlign: 'left',
  startArrowhead: null,
  endArrowhead: 'arrow',
  arrowType: 'round',
};

export const DEFAULT_LINE_HEIGHT = 1.25;
