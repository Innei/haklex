import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Dot,
  Ellipsis,
  Equal,
  GripHorizontal,
  Hash,
  Menu,
  Minus,
  MoveRight,
  Ruler,
  Slash,
  Spline,
  Square,
  Squircle,
  Waypoints,
} from 'lucide-react';

import type { ElementStyle } from '../model/defaults';

export interface Choice<K extends keyof ElementStyle> {
  icon?: LucideIcon;
  label: string;
  value: ElementStyle[K];
}

export const STROKE_COLORS = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00'];
export const BACKGROUND_COLORS = ['transparent', '#ffc9c9', '#b2f2bb', '#a5d8ff', '#ffec99'];

export const FILL_STYLES: Choice<'fillStyle'>[] = [
  { value: 'hachure', label: 'Hachure', icon: Slash },
  { value: 'cross-hatch', label: 'Cross-hatch', icon: Hash },
  { value: 'solid', label: 'Solid', icon: Square },
];

export const STROKE_WIDTHS: Choice<'strokeWidth'>[] = [
  { value: 1, label: 'Thin', icon: Minus },
  { value: 2, label: 'Bold', icon: Equal },
  { value: 4, label: 'Extra bold', icon: Menu },
];

export const STROKE_STYLES: Choice<'strokeStyle'>[] = [
  { value: 'solid', label: 'Solid', icon: Minus },
  { value: 'dashed', label: 'Dashed', icon: GripHorizontal },
  { value: 'dotted', label: 'Dotted', icon: Ellipsis },
];

export const ROUGHNESS: Choice<'roughness'>[] = [
  { value: 0, label: 'Architect', icon: Ruler },
  { value: 1, label: 'Artist', icon: Spline },
  { value: 2, label: 'Cartoonist', icon: Activity },
];

export const ROUNDNESS: Choice<'roundness'>[] = [
  { value: 'sharp', label: 'Sharp', icon: Square },
  { value: 'round', label: 'Round', icon: Squircle },
];

export const SHADOWS: Choice<'shadow'>[] = [
  { value: false, label: 'None' },
  { value: true, label: 'Soft' },
];

export const FONT_SIZES: Choice<'fontSize'>[] = [
  { value: 16, label: 'S' },
  { value: 20, label: 'M' },
  { value: 28, label: 'L' },
  { value: 36, label: 'XL' },
];

export const FONT_FAMILIES: Choice<'fontFamily'>[] = [
  { value: 5, label: 'Hand' },
  { value: 2, label: 'Sans' },
  { value: 3, label: 'Mono' },
];

export const TEXT_ALIGNS: Choice<'textAlign'>[] = [
  { value: 'left', label: 'Left', icon: AlignLeft },
  { value: 'center', label: 'Center', icon: AlignCenter },
  { value: 'right', label: 'Right', icon: AlignRight },
];

export const ARROWHEADS: Choice<'endArrowhead'>[] = [
  { value: null, label: 'None', icon: Minus },
  { value: 'arrow', label: 'Arrow', icon: MoveRight },
  { value: 'triangle', label: 'Triangle', icon: Slash },
  { value: 'dot', label: 'Dot', icon: Dot },
  { value: 'bar', label: 'Bar', icon: Menu },
];

export const ARROW_TYPES: Choice<'arrowType'>[] = [
  { value: 'sharp', label: 'Sharp', icon: Slash },
  { value: 'round', label: 'Curved', icon: Spline },
  { value: 'elbow', label: 'Elbow', icon: Waypoints },
];
