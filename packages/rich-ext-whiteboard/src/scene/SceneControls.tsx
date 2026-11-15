import { Maximize2, ScanSearch, ZoomIn, ZoomOut } from 'lucide-react';
import type { FC } from 'react';

import * as css from './styles.css';

export interface SceneControlsProps {
  onExpand?: (target: HTMLElement) => void;
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  scale: number;
}

export const SceneControls: FC<SceneControlsProps> = ({
  onExpand,
  onFit,
  onZoomIn,
  onZoomOut,
  scale,
}) => (
  <div className={css.toolbar}>
    <button
      aria-label="Zoom out"
      className={css.toolButton}
      title="Zoom out (⌘/Ctrl + scroll)"
      type="button"
      onClick={onZoomOut}
    >
      <ZoomOut />
    </button>
    <span className={css.zoomLabel}>{Math.round(scale * 100)}%</span>
    <button
      aria-label="Zoom in"
      className={css.toolButton}
      title="Zoom in (⌘/Ctrl + scroll)"
      type="button"
      onClick={onZoomIn}
    >
      <ZoomIn />
    </button>
    <span aria-hidden className={css.toolSeparator} />
    <button
      aria-label="Fit to content"
      className={css.toolButton}
      title="Fit to content (double-click)"
      type="button"
      onClick={onFit}
    >
      <ScanSearch />
    </button>
    {onExpand && (
      <>
        <span aria-hidden className={css.toolSeparator} />
        <button
          aria-label="Fullscreen"
          className={css.toolButton}
          title="Fullscreen"
          type="button"
          onClick={(e) => onExpand(e.currentTarget)}
        >
          <Maximize2 />
        </button>
      </>
    )}
  </div>
);
