import 'react-photo-view/dist/react-photo-view.css';

import { vars } from '@haklex/rich-editor';
import { decodeThumbHash, type ImageRendererProps } from '@haklex/rich-editor/renderers';
import type { ComponentType, CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';

import * as styles from './styles.css';

type ImageLoadState = 'loading' | 'loaded' | 'error';

const frameStateSemanticClass: Record<ImageLoadState, string> = {
  loading: styles.semanticClassNames.frameLoading,
  loaded: styles.semanticClassNames.frameLoaded,
  error: styles.semanticClassNames.frameError,
};

function getCaptionText(altText: string, caption?: string): string | undefined {
  if (caption) return caption;
  if (!altText) return undefined;
  if (altText.startsWith('!') || altText.startsWith('¡')) {
    return altText.slice(1);
  }
  return undefined;
}

export const ImageRenderer: ComponentType<ImageRendererProps> = ({
  src,
  altText,
  width,
  height,
  caption,
  thumbhash,
  accent,
}) => {
  const [state, setState] = useState<ImageLoadState>('loading');

  const captionText = useMemo(() => getCaptionText(altText, caption), [altText, caption]);

  const placeholderUrl = useMemo(
    () => (thumbhash ? decodeThumbHash(thumbhash) : undefined),
    [thumbhash],
  );

  if (!src) return null;

  const frameStyle: CSSProperties = {
    backgroundColor: !placeholderUrl ? accent || vars.color.bgTertiary : undefined,
    backgroundImage: placeholderUrl && state !== 'loaded' ? `url(${placeholderUrl})` : undefined,
    backgroundSize: 'cover',
    width: width ? Math.min(width, 1200) : undefined,
    maxWidth: '100%',
    ...(width && height ? { aspectRatio: `${width} / ${height}` } : {}),
  };

  return (
    <figure className={`${styles.root} ${styles.semanticClassNames.root}`}>
      <PhotoProvider photoClosable>
        <PhotoView src={src}>
          <div
            aria-label={`Open image: ${altText || 'image'}`}
            className={`${styles.frame} ${styles.semanticClassNames.frame} ${styles.imageState[state]} ${frameStateSemanticClass[state]}`.trim()}
            role="button"
            style={frameStyle}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              e.currentTarget.click();
            }}
          >
            <img
              alt={altText}
              className={`${styles.image} ${state === 'loaded' ? styles.imageVisible : ''} ${styles.semanticClassNames.image}`}
              data-state={state}
              height={height}
              loading="lazy"
              src={src}
              style={width && height ? { height: '100%', objectFit: 'cover' } : undefined}
              width={width}
              onError={() => setState('error')}
              onLoad={() => setState('loaded')}
            />

            {state === 'loading' && (
              <span className={`${styles.loader} ${styles.semanticClassNames.loader}`} />
            )}

            {state === 'error' && (
              <span className={`${styles.errorBadge} ${styles.semanticClassNames.errorBadge}`}>
                Image failed to load
              </span>
            )}
          </div>
        </PhotoView>
      </PhotoProvider>

      {captionText && (
        <figcaption className={`${styles.caption} ${styles.semanticClassNames.caption}`}>
          {captionText}
        </figcaption>
      )}
    </figure>
  );
};
