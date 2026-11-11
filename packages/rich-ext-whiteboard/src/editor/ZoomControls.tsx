import { ActionButton } from '@haklex/rich-editor-ui';
import { Minus, Plus, Redo2, Undo2 } from 'lucide-react';
import type { FC } from 'react';

import * as css from './chrome.css';
import { resetZoom, ZOOM_STEP, zoomBy } from './shortcuts';
import type { WhiteboardStore } from './store';
import { useStore } from './store';

export const ZoomControls: FC<{ compact?: boolean; store: WhiteboardStore }> = ({
  compact = false,
  store,
}) => {
  const zoom = useStore(store, (s) => s.viewport.zoom);
  useStore(store, (s) => s.elements);
  return (
    <div
      data-whiteboard-chrome
      className={`${css.floating} ${css.zoom}${compact ? ` ${css.zoomTop}` : ''}`}
    >
      <ActionButton
        icon
        aria-label="Undo"
        disabled={!store.canUndo()}
        size="sm"
        variant="ghost"
        onClick={() => store.undo()}
      >
        <Undo2 />
      </ActionButton>
      <ActionButton
        icon
        aria-label="Redo"
        disabled={!store.canRedo()}
        size="sm"
        variant="ghost"
        onClick={() => store.redo()}
      >
        <Redo2 />
      </ActionButton>
      {!compact && (
        <>
          <span className={css.separator} />
          <ActionButton
            icon
            aria-label="Zoom out"
            size="sm"
            variant="ghost"
            onClick={() => zoomBy(store, 1 / ZOOM_STEP)}
          >
            <Minus />
          </ActionButton>
          <button
            aria-label="Reset zoom"
            className={css.zoomValue}
            type="button"
            onClick={() => resetZoom(store)}
          >
            {Math.round(zoom * 100)}%
          </button>
          <ActionButton
            icon
            aria-label="Zoom in"
            size="sm"
            variant="ghost"
            onClick={() => zoomBy(store, ZOOM_STEP)}
          >
            <Plus />
          </ActionButton>
        </>
      )}
    </div>
  );
};
