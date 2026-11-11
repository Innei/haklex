import type { WhiteboardStore } from './store';
import { useStore } from './store';

export const NARROW_WIDTH = 640;

export function useNarrowLayout(store: WhiteboardStore): boolean {
  return useStore(store, (s) => s.canvasSize.width > 0 && s.canvasSize.width < NARROW_WIDTH);
}
