import { useAtomValue } from 'jotai';

import { toolbarVisibleAtom } from './atoms';
import * as styles from './styles.css';
import { useImageResize } from './useImageResize';

export function ResizeHandles() {
  const visible = useAtomValue(toolbarVisibleAtom);
  const { handlePointerDown } = useImageResize();
  const visibleClass = visible ? styles.resizeHandleVisible : '';

  return (
    <>
      <span
        className={`${styles.resizeHandle} ${styles.resizeHandleLeft} ${visibleClass} ${styles.semanticClassNames.resizeHandle}`.trim()}
        onPointerDown={(e) => handlePointerDown(e, 'left')}
      />
      <span
        className={`${styles.resizeHandle} ${styles.resizeHandleRight} ${visibleClass} ${styles.semanticClassNames.resizeHandle}`.trim()}
        onPointerDown={(e) => handlePointerDown(e, 'right')}
      />
    </>
  );
}
