import type { Point } from '../../model/geometry';
import { getHitElement } from '../selection-utils';
import { canHoldText, startTextEditing } from '../text-actions';
import type { ToolHandler } from './types';
import { HIT_TOLERANCE } from './types';

export function createTextTool(): ToolHandler {
  let downAt: Point | null = null;

  return {
    onPointerDown(_ctx, e) {
      downAt = e.scene;
    },
    onPointerMove() {},
    // Editing starts on pointerup: a textarea focused during pointerdown loses focus to the
    // canvas when the browser's mousedown default runs, which discards the empty text.
    onPointerUp(ctx) {
      const at = downAt;
      downAt = null;
      if (!at) return;
      const { store } = ctx;
      const state = store.getState();
      const hit = getHitElement(state.elements, at, HIT_TOLERANCE / state.viewport.zoom);
      if (!state.toolLocked) store.setState({ tool: 'selection' });
      if (hit?.type === 'text') {
        startTextEditing(store, { elementId: hit.id });
      } else if (hit && canHoldText(hit) && hit.type !== 'arrow') {
        startTextEditing(store, { containerId: hit.id });
      } else {
        startTextEditing(store, { at });
      }
    },
    cancel() {
      downAt = null;
    },
  };
}
