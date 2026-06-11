import { decodeThumbHash, type ImageRendererProps } from '@haklex/rich-editor/renderers';
import { vars } from '@haklex/rich-editor/static';
import type { CSSProperties, KeyboardEvent, Ref } from 'react';
import { useMemo, useRef, useState } from 'react';

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

export interface ImageRendererInteractiveProps extends ImageRendererProps {
  onActivate?: (target: HTMLElement) => void;
  ref?: Ref<HTMLElement>;
}

export function ImageRenderer({
  src,
  altText,
  width,
  height,
  caption,
  thumbhash,
  accent,
  displayWidth,
  layout,
  onActivate,
  ref,
}: ImageRendererInteractiveProps) {
  const [state, setState] = useState<ImageLoadState>('loading');
  const imgRef = useRef<HTMLImageElement>(null);

  const captionText = useMemo(() => getCaptionText(altText, caption), [altText, caption]);

  const placeholderUrl = useMemo(
    () => (thumbhash ? decodeThumbHash(thumbhash) : undefined),
    [thumbhash],
  );

  if (!src) return null;

  const interactive = Boolean(onActivate);

  const frameStyle: CSSProperties = {
    backgroundColor:
      state !== 'loaded' && !placeholderUrl ? accent || vars.color.bgTertiary : 'transparent',
    backgroundImage: placeholderUrl && state !== 'loaded' ? `url(${placeholderUrl})` : undefined,
    backgroundSize: 'cover',
    width: width ? Math.min(width, 1200) : undefined,
    maxWidth: '100%',
    ...(width && height ? { aspectRatio: `${width} / ${height}` } : {}),
  };

  const activate = () => {
    if (imgRef.current) onActivate?.(imgRef.current);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    activate();
  };

  const figureStyle = displayWidth
    ? ({ '--rich-image-display-width': `${displayWidth}%` } as CSSProperties)
    : undefined;

  return (
    <figure
      className={`${styles.root} ${styles.semanticClassNames.root}`}
      data-layout={layout}
      ref={ref}
      style={figureStyle}
    >
      <div
        aria-label={interactive ? `Open image: ${altText || 'image'}` : undefined}
        className={`${styles.frame} ${interactive ? '' : styles.frameStatic} ${styles.semanticClassNames.frame} ${styles.imageState[state]} ${frameStateSemanticClass[state]}`.trim()}
        role={interactive ? 'button' : undefined}
        style={frameStyle}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? activate : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
      >
        <img
          alt={altText}
          className={`${styles.image} ${state === 'loaded' ? styles.imageVisible : ''} ${styles.semanticClassNames.image}`}
          data-state={state}
          height={height}
          loading="lazy"
          ref={imgRef}
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

      {captionText && (
        <figcaption className={`${styles.caption} ${styles.semanticClassNames.caption}`}>
          {captionText}
        </figcaption>
      )}
    </figure>
  );
}
