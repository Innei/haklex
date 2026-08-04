import { decodeThumbHash } from '@haklex/rich-editor/renderers';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ComponentType, UIEventHandler } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import * as css from './styles.css';
import type {
  GalleryAspect,
  GalleryFit,
  GalleryImage,
  GalleryLayout,
  GalleryOnImageClick,
  GalleryRendererProps,
} from './types';

const IMAGE_CONTAINER_MARGIN_INSET = 60;
const CHILD_GAP = 15;
const AUTOPLAY_DURATION = 5000;

const GALLERY_ASPECT_RATIO_CSS: Record<GalleryAspect, string | undefined> = {
  'auto': undefined,
  '1:1': '1 / 1',
  '4:3': '4 / 3',
  '16:9': '16 / 9',
  '3:4': '3 / 4',
};

function throttle<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (!timeout) {
      timeout = setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    }
  }) as T;
}

function clsx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

function useThumbhashStyle(image: GalleryImage): React.CSSProperties | undefined {
  return useMemo(() => {
    if (!image.thumbhash) return;
    const url = decodeThumbHash(image.thumbhash);
    if (!url) return;
    return { backgroundImage: `url(${url})`, backgroundSize: 'cover' };
  }, [image.thumbhash]);
}

export const GalleryRenderer: ComponentType<GalleryRendererProps> = ({
  aspect = 'auto',
  fit = 'cover',
  images,
  layout,
  maxItemHeight,
  onImageClick,
}) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [, setUpdated] = useState({});
  const memoedChildContainerWidthRef = useRef(0);

  useEffect(() => {
    if (!containerRef) return;

    const ob = new ResizeObserver(() => {
      setUpdated({});
      calChild(containerRef);
    });

    function calChild(containerRef: HTMLDivElement) {
      const $child = containerRef.children.item(0);
      if ($child) {
        memoedChildContainerWidthRef.current = $child.clientWidth;
      }
    }

    calChild(containerRef);
    ob.observe(containerRef);
    return () => {
      ob.disconnect();
    };
  }, [containerRef]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOnScroll: UIEventHandler<HTMLDivElement> = useCallback(
    throttle<UIEventHandler<HTMLDivElement>>((e) => {
      const $ = e.target as HTMLDivElement;

      const index = Math.floor(
        ($.scrollLeft + IMAGE_CONTAINER_MARGIN_INSET + 15) / memoedChildContainerWidthRef.current,
      );
      setCurrentIndex(index);
    }, 60),
    [],
  );

  const handleScrollTo = useCallback(
    (i: number) => {
      if (!containerRef) return;

      containerRef.scrollTo({
        left: memoedChildContainerWidthRef.current * i,
        behavior: 'smooth',
      });
    },
    [containerRef],
  );

  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isForward = useRef(true);
  const autoplayRef = useRef(true);

  const handleCancelAutoplay = useCallback(() => {
    if (!autoplayRef.current) return;

    autoplayRef.current = false;
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }
  }, []);

  const { ref } = useInView({
    initialInView: false,
    triggerOnce: images.length < 2,
    onChange(inView) {
      if (images.length < 2 || !autoplayRef.current) return;

      if (inView) {
        autoplayTimerRef.current = setInterval(() => {
          setCurrentIndex((prev) => {
            if (prev + 1 > images.length - 1 && isForward.current) {
              isForward.current = false;
            }
            if (prev - 1 < 0 && !isForward.current) {
              isForward.current = true;
            }

            const index = prev + (isForward.current ? 1 : -1);
            handleScrollTo(index);
            return index;
          });
        }, AUTOPLAY_DURATION);
      } else {
        if (autoplayTimerRef.current) {
          clearInterval(autoplayTimerRef.current);
        }
      }
    },
  });

  useEffect(
    () => () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    },
    [],
  );

  if (images.length === 0) return null;

  const layoutClass =
    layout === 'masonry'
      ? css.galleryMasonry
      : layout === 'carousel'
        ? css.galleryCarousel
        : css.galleryGrid;

  if (images.length === 1 || layout === 'grid' || layout === 'masonry') {
    return (
      <div className={clsx(css.gallery, layoutClass)}>
        {images.map((image, index) => (
          <GalleryFigure
            aspect={aspect}
            fit={fit}
            image={image}
            images={images}
            index={index}
            key={index}
            layout={layout}
            maxItemHeight={maxItemHeight}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(css.gallery, css.galleryCarousel)}
      ref={ref}
      onTouchMove={handleCancelAutoplay}
      onWheel={handleCancelAutoplay}
    >
      <div
        className={css.galleryContainer}
        ref={setContainerRef}
        onScroll={handleOnScroll}
        onTouchStart={handleCancelAutoplay}
      >
        {images.map((image, index) => (
          <GalleryFigure
            aspect={aspect}
            fit={fit}
            image={image}
            images={images}
            index={index}
            key={index}
            layout={layout}
            maxItemHeight={maxItemHeight}
            style={{
              width: `calc(100% - ${IMAGE_CONTAINER_MARGIN_INSET}px)`,
              marginRight: `${CHILD_GAP}px`,
            }}
            onImageClick={onImageClick}
          />
        ))}
      </div>

      {currentIndex > 0 && (
        <button
          className={clsx(css.galleryNav, css.galleryNavPrev)}
          onClick={() => handleScrollTo(currentIndex - 1)}
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {currentIndex < images.length - 1 && (
        <button
          className={clsx(css.galleryNav, css.galleryNavNext)}
          onClick={() => handleScrollTo(currentIndex + 1)}
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div className={css.galleryIndicators}>
        {images.map((_, i) => (
          <div
            className={clsx(css.galleryIndicator, currentIndex === i && css.galleryIndicatorActive)}
            key={i}
            onClick={() => handleScrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
};

interface GalleryFigureProps {
  aspect: GalleryAspect;
  fit: GalleryFit;
  image: GalleryImage;
  images: GalleryImage[];
  index: number;
  layout: GalleryLayout;
  maxItemHeight?: number;
  onImageClick?: GalleryOnImageClick;
  style?: React.CSSProperties;
}

const GalleryFigure = memo(
  ({
    aspect,
    fit,
    image,
    images,
    index,
    layout,
    maxItemHeight,
    onImageClick,
    style,
  }: GalleryFigureProps) => {
    const thumbStyle = useThumbhashStyle(image);
    const imgRef = useRef<HTMLImageElement>(null);
    const interactive = Boolean(onImageClick);

    const activate = () => {
      if (imgRef.current) {
        onImageClick?.({ current: image, images, index, target: imgRef.current });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      activate();
    };

    const aspectRatio = layout === 'masonry' ? undefined : GALLERY_ASPECT_RATIO_CSS[aspect];
    const imageStyle: React.CSSProperties = aspectRatio
      ? { width: '100%', height: '100%', objectFit: fit }
      : layout === 'masonry' && maxItemHeight !== undefined
        ? { maxHeight: `${maxItemHeight}px`, maxWidth: '100%', width: 'auto' }
        : { maxWidth: '100%', height: 'auto' };
    const figureStyle: React.CSSProperties = {
      ...thumbStyle,
      ...style,
      ...(aspectRatio ? { aspectRatio } : null),
      ...(interactive ? null : { cursor: 'default' }),
    };

    return (
      <figure
        aria-label={interactive ? `Open image: ${image.alt || 'image'}` : undefined}
        className={css.galleryItem}
        role={interactive ? 'button' : undefined}
        style={figureStyle}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? activate : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
      >
        <img
          alt={image.alt || ''}
          height={image.height}
          loading="lazy"
          ref={imgRef}
          src={image.src}
          style={imageStyle}
          width={image.width}
        />
      </figure>
    );
  },
);

export default memo(GalleryRenderer);
