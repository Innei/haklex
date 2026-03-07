import { useRendererMode } from '@haklex/rich-editor';
import type { ImageRendererProps } from '@haklex/rich-editor/renderers';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

import {
  altTextAtom,
  captionTextAtom,
  focusCaptionOnOpenAtom,
  frameStyleAtom,
  heightAtom,
  hoveringAtom,
  loadStateAtom,
  metaOpenAtom,
  replaceOpenAtom,
  srcAtom,
  widthAtom,
  wrapperRefAtom,
} from './atoms';
import { ImageEditProvider } from './ImageEditContext';
import { ImageEditToolbar } from './ImageEditToolbar';
import { ImageRenderer } from './ImageRenderer';
import { ReplacePopover } from './ReplacePopover';
import * as styles from './styles.css';

const frameStateSemanticClass = {
  loading: styles.semanticClassNames.frameLoading,
  loaded: styles.semanticClassNames.frameLoaded,
  error: styles.semanticClassNames.frameError,
} as const;

export function ImageEditRenderer(props: ImageRendererProps) {
  const mode = useRendererMode();

  if (mode !== 'editor') {
    return <ImageRenderer {...props} />;
  }

  return <ImageEditRendererInner {...props} />;
}

function ImageEditRendererInner(props: ImageRendererProps) {
  const [editor] = useLexicalComposerContext();
  const editable = editor.isEditable();

  if (!editable) {
    return <ImageRenderer {...props} />;
  }

  return (
    <ImageEditProvider props={props}>
      <ImageEditContent />
    </ImageEditProvider>
  );
}

function ImageEditContent() {
  const wrapperRef = useAtomValue(wrapperRefAtom);
  const setHovering = useSetAtom(hoveringAtom);
  const src = useAtomValue(srcAtom);
  const loadState = useAtomValue(loadStateAtom);
  const setLoadState = useSetAtom(loadStateAtom);
  const frameStyle = useAtomValue(frameStyleAtom);
  const altText = useAtomValue(altTextAtom);
  const width = useAtomValue(widthAtom);
  const height = useAtomValue(heightAtom);
  const captionText = useAtomValue(captionTextAtom);
  const setMetaOpen = useSetAtom(metaOpenAtom);
  const setReplaceOpen = useSetAtom(replaceOpenAtom);
  const setFocusCaptionOnOpen = useSetAtom(focusCaptionOnOpenAtom);

  const handleCaptionClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const scrollY = window.scrollY;
      setReplaceOpen(false);
      setMetaOpen(true);
      setFocusCaptionOnOpen(true);
      // BaseUI Popover focus management may cause scroll; restore position
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY });
      });
    },
    [setMetaOpen, setReplaceOpen, setFocusCaptionOnOpen],
  );

  return (
    <div
      className={`${styles.editTrigger} ${styles.semanticClassNames.editTrigger}`}
      ref={wrapperRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {src ? (
        <figure className={`${styles.root} ${styles.semanticClassNames.root}`}>
          <div
            className={`${styles.frame} ${styles.semanticClassNames.frame} ${styles.frameEditMode} ${styles.imageState[loadState]} ${frameStateSemanticClass[loadState]}`.trim()}
            style={frameStyle}
          >
            <img
              alt={altText}
              className={`${styles.image} ${loadState === 'loaded' ? styles.imageVisible : ''} ${styles.semanticClassNames.image}`}
              height={height}
              loading="lazy"
              src={src}
              width={width}
              onError={() => setLoadState('error')}
              onLoad={() => setLoadState('loaded')}
            />
            {loadState === 'loading' && (
              <span className={`${styles.loader} ${styles.semanticClassNames.loader}`} />
            )}
            {loadState === 'error' && (
              <span className={`${styles.errorBadge} ${styles.semanticClassNames.errorBadge}`}>
                Image failed to load
              </span>
            )}
          </div>
          {captionText && (
            <figcaption
              className={`${styles.caption} ${styles.semanticClassNames.caption}`}
              onClick={handleCaptionClick}
            >
              {captionText}
            </figcaption>
          )}
        </figure>
      ) : (
        <ReplacePopover />
      )}

      {src && <ImageEditToolbar />}
    </div>
  );
}
