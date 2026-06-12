import { $isImageNode, sanitizeImageDisplayWidth } from '@haklex/rich-editor/nodes';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useStore } from 'jotai';
import { $getNearestNodeFromDOMNode } from 'lexical';
import { useCallback, useEffect, useRef } from 'react';

import { layoutAtom, resizingAtom, wrapperRefAtom } from './atoms';
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
      const container = blockWrapper?.parentElement ?? trigger.parentElement;
      if (!frame || !figure || !container) return;

      // width: N% resolves against the content box, so exclude padding.
      const containerStyle = getComputedStyle(container);
      const containerWidth =
        container.clientWidth -
        Number.parseFloat(containerStyle.paddingLeft) -
        Number.parseFloat(containerStyle.paddingRight);
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

      let percent = sanitizeImageDisplayWidth((startWidth / containerWidth) * 100) ?? 100;
      let moved = false;

      const handleMove = (moveEvent: PointerEvent) => {
        const rawDelta = moveEvent.clientX - startX;
        if (!moved && Math.abs(rawDelta) < MOVE_THRESHOLD_PX) return;
        moved = true;
        const outward = side === 'left' ? -rawDelta : rawDelta;
        const nextWidth = startWidth + outward * factor;
        percent = sanitizeImageDisplayWidth((nextWidth / containerWidth) * 100) ?? percent;
        if (isFloat && blockWrapper) {
          blockWrapper.style.width = `${percent}%`;
        } else {
          figure.style.setProperty('--rich-image-display-width', `${percent}%`);
        }
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
            if ($isImageNode(node)) node.setDisplayWidth(percent);
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
