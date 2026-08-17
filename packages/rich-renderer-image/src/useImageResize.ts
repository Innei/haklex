import {
  $isImageNode,
  imageDisplayCssVars,
  imageDisplaySizeAfterResize,
  resolveImageDisplaySize,
} from '@haklex/rich-editor/nodes';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useStore } from 'jotai';
import { $getNearestNodeFromDOMNode } from 'lexical';
import { useCallback, useEffect, useRef } from 'react';

import {
  displayWidthAtom,
  fixedHeightAtom,
  fixedWidthAtom,
  layoutAtom,
  resizingAtom,
  wrapperRefAtom,
} from './atoms';
import { measureImageContainerWidth } from './image-metrics';
import { semanticClassNames } from './styles.css';

export type ResizeSide = 'left' | 'right';

const MOVE_THRESHOLD_PX = 3;

export function useImageResize() {
  const store = useStore();
  const [editor] = useLexicalComposerContext();
  const finishRef = useRef<((commit: boolean) => void) | null>(null);

  useEffect(() => () => finishRef.current?.(false), []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>, side: ResizeSide) => {
      const trigger = store.get(wrapperRefAtom).current;
      if (!trigger) return;
      const frame = trigger.querySelector<HTMLElement>(`.${semanticClassNames.frame}`);
      const figure = trigger.querySelector<HTMLElement>('figure');
      const blockWrapper = trigger.closest<HTMLElement>('.rich-image-wrapper');
      if (!frame || !figure) return;

      const containerWidth = measureImageContainerWidth(trigger);
      const startWidth = frame.getBoundingClientRect().width;
      if (!containerWidth || containerWidth <= 0 || !startWidth) return;

      event.preventDefault();
      event.stopPropagation();

      const layout = store.get(layoutAtom);
      // Centered images resize symmetrically toward center, so a 1px outward
      // drag grows the width by 2px.
      const factor = layout === undefined ? 2 : 1;
      const isFloat = layout === 'float-left' || layout === 'float-right';
      const startX = event.clientX;
      const handle = event.currentTarget;
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        // Pointer may already be inactive (NotFoundError); resize still works
        // via the handle listeners.
      }
      store.set(resizingAtom, true);
      const prevUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = 'none';

      const startHeight = frame.getBoundingClientRect().height;
      const aspect = startWidth > 0 && startHeight > 0 ? startHeight / startWidth : undefined;
      const currentMode = resolveImageDisplaySize({
        displayWidth: store.get(displayWidthAtom),
        fixedWidth: store.get(fixedWidthAtom),
        fixedHeight: store.get(fixedHeightAtom),
      }).mode;
      let nextSize = imageDisplaySizeAfterResize(
        currentMode,
        startWidth,
        startHeight,
        containerWidth,
      );
      let moved = false;

      const applyPreview = (size: typeof nextSize) => {
        const vars = imageDisplayCssVars(size);
        figure.style.removeProperty('--rich-image-display-width');
        figure.style.removeProperty('--rich-image-display-height');
        if (vars) {
          for (const [key, value] of Object.entries(vars)) {
            figure.style.setProperty(key, value);
          }
        }
        if (isFloat && blockWrapper) {
          if (size.mode === 'percent') {
            blockWrapper.style.width = `${size.value}%`;
            blockWrapper.style.maxWidth = '';
          } else if (size.mode === 'fixed-width') {
            blockWrapper.style.width = `${size.px}px`;
            blockWrapper.style.maxWidth = '100%';
          } else if (size.mode === 'fixed-height') {
            blockWrapper.style.width = 'auto';
            blockWrapper.style.maxWidth = '100%';
          }
        }
      };

      const handleMove = (moveEvent: PointerEvent) => {
        const rawDelta = moveEvent.clientX - startX;
        if (!moved && Math.abs(rawDelta) < MOVE_THRESHOLD_PX) return;
        moved = true;
        const outward = side === 'left' ? -rawDelta : rawDelta;
        const nextWidth = startWidth + outward * factor;
        const nextHeight = aspect ? nextWidth * aspect : startHeight;
        nextSize = imageDisplaySizeAfterResize(currentMode, nextWidth, nextHeight, containerWidth);
        applyPreview(nextSize);
      };

      const finish = (commit: boolean) => {
        if (finishRef.current !== finish) return;
        finishRef.current = null;
        handle.removeEventListener('pointermove', handleMove);
        handle.removeEventListener('pointerup', handleEnd);
        handle.removeEventListener('pointercancel', handleEnd);
        document.body.style.userSelect = prevUserSelect;
        store.set(resizingAtom, false);
        if (!commit || !moved) return;
        editor.update(
          () => {
            const node = $getNearestNodeFromDOMNode(trigger);
            if ($isImageNode(node)) node.applyDisplaySize(nextSize);
          },
          // Without this tag Lexical scrolls the (possibly offscreen) caret
          // back into view on commit, yanking the scroll position.
          { tag: 'skip-scroll-into-view' },
        );
      };
      const handleEnd = () => finish(true);

      finishRef.current = finish;
      handle.addEventListener('pointermove', handleMove);
      handle.addEventListener('pointerup', handleEnd);
      handle.addEventListener('pointercancel', handleEnd);
    },
    [editor, store],
  );

  return { handlePointerDown };
}
