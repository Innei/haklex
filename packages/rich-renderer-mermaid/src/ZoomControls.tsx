import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import type { FC } from 'react';
import { useControls } from 'react-zoom-pan-pinch';

import * as css from './styles.css';

export const ZoomControls: FC = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className={css.zoomControls}>
      <button aria-label="Zoom in" className={css.zoomBtn} type="button" onClick={() => zoomIn()}>
        <ZoomIn size={14} />
      </button>
      <button aria-label="Zoom out" className={css.zoomBtn} type="button" onClick={() => zoomOut()}>
        <ZoomOut size={14} />
      </button>
      <button
        aria-label="Reset zoom"
        className={css.zoomBtn}
        type="button"
        onClick={() => resetTransform()}
      >
        <Maximize2 size={14} />
      </button>
    </div>
  );
};
