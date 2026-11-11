import type { Point } from '../model/geometry';
import type { WhiteboardStore } from './store';

export const DEFAULT_GRID_SIZE = 20;

export function activeGrid(store: WhiteboardStore, e: { ctrlKey: boolean }): number | null {
  const { gridSize } = store.getState();
  return gridSize && gridSize > 0 && !e.ctrlKey ? gridSize : null;
}

export const snapValue = (value: number, grid: number | null) =>
  grid ? Math.round(value / grid) * grid : value;

export const snapPoint = ([x, y]: Point, grid: number | null): Point =>
  grid ? [snapValue(x, grid), snapValue(y, grid)] : [x, y];
