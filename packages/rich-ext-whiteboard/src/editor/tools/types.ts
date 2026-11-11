import type { Point } from '../../model/geometry';
import type { WhiteboardStore } from '../store';

export interface PointerInfo {
  altKey: boolean;
  ctrlKey: boolean;
  pointerId: number;
  pointerType: string;
  pressure: number;
  scene: Point;
  screen: Point;
  shiftKey: boolean;
}

export interface ToolContext {
  onFiles?: (files: File[], at: Point) => void;
  requestImage?: (at: Point) => void;
  store: WhiteboardStore;
}

export interface ToolHandler {
  cancel?: (ctx: ToolContext) => void;
  onDoubleClick?: (ctx: ToolContext, e: PointerInfo) => void;
  onKeyDown?: (ctx: ToolContext, e: KeyboardEvent) => boolean;
  onPointerDown: (ctx: ToolContext, e: PointerInfo) => void;
  onPointerMove: (ctx: ToolContext, e: PointerInfo) => void;
  onPointerUp: (ctx: ToolContext, e: PointerInfo) => void;
}

export const HIT_TOLERANCE = 6;
export const DRAG_THRESHOLD = 2;
