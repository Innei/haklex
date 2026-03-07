import 'react-photo-view/dist/react-photo-view.css'

import {
  decodeThumbHash,
  type GalleryImage,
  type GalleryRendererProps,
} from '@haklex/rich-editor'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ComponentType, UIEventHandler } from 'react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { PhotoProvider, PhotoView } from 'react-photo-view'

import * as css from './styles.css'

const IMAGE_CONTAINER_MARGIN_INSET = 60
const CHILD_GAP = 15
const AUTOPLAY_DURATION = 5000

function throttle<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return ((...args: Parameters<T>) => {
    if (!timeout) {
      timeout = setTimeout(() => {
        func(...args)
        timeout = null
      }, wait)
    }
  }) as T
}

function clsx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

function useThumbhashStyle(
  image: GalleryImage,
): React.CSSProperties | undefined {
  return useMemo(() => {
    if (!image.thumbhash) return
    const url = decodeThumbHash(image.thumbhash)
    if (!url) return
    return { backgroundImage: `url(${url})`, backgroundSize: 'cover' }
  }, [image.thumbhash])
}

export const GalleryRenderer: ComponentType<GalleryRendererProps> = ({
  images,
  layout,
}) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)
  const [, setUpdated] = useState({})
  const memoedChildContainerWidthRef = useRef(0)

  useEffect(() => {
    if (!containerRef) return

    const ob = new ResizeObserver(() => {
      setUpdated({})
      calChild(containerRef)
    })

    function calChild(containerRef: HTMLDivElement) {
      const $child = containerRef.children.item(0)
      if ($child) {
        memoedChildContainerWidthRef.current = $child.clientWidth
      }
    }

    calChild(containerRef)
    ob.observe(containerRef)
    return () => {
      ob.disconnect()
    }
  }, [containerRef])

  const [currentIndex, setCurrentIndex] = useState(0)

  const handleOnScroll: UIEventHandler<HTMLDivElement> = useCallback(
    throttle<UIEventHandler<HTMLDivElement>>((e) => {
      const $ = e.target as HTMLDivElement

      const index = Math.floor(
        ($.scrollLeft + IMAGE_CONTAINER_MARGIN_INSET + 15) /
          memoedChildContainerWidthRef.current,
      )
      setCurrentIndex(index)
    }, 60),
    [],
  )

  const handleScrollTo = useCallback(
    (i: number) => {
      if (!containerRef) return

      containerRef.scrollTo({
        left: memoedChildContainerWidthRef.current * i,
        behavior: 'smooth',
      })
    },
    [containerRef],
  )

  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isForward = useRef(true)
  const autoplayRef = useRef(true)

  const handleCancelAutoplay = useCallback(() => {
    if (!autoplayRef.current) return

    autoplayRef.current = false
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current)
    }
  }, [])

  const { ref } = useInView({
    initialInView: false,
    triggerOnce: images.length < 2,
    onChange(inView) {
      if (images.length < 2 || !autoplayRef.current) return

      if (inView) {
        autoplayTimerRef.current = setInterval(() => {
          setCurrentIndex((prev) => {
            if (prev + 1 > images.length - 1 && isForward.current) {
              isForward.current = false
            }
            if (prev - 1 < 0 && !isForward.current) {
              isForward.current = true
            }

            const index = prev + (isForward.current ? 1 : -1)
            handleScrollTo(index)
            return index
          })
        }, AUTOPLAY_DURATION)
      } else {
        if (autoplayTimerRef.current) {
          clearInterval(autoplayTimerRef.current)
        }
      }
    },
  })

  useEffect(
    () => () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current)
      }
    },
    [],
  )

  if (images.length === 0) return null

  const layoutClass =
    layout === 'masonry'
      ? css.galleryMasonry
      : layout === 'carousel'
        ? css.galleryCarousel
        : css.galleryGrid

  if (images.length === 1 || layout === 'grid' || layout === 'masonry') {
    return (
      <PhotoProvider>
        <div className={clsx(css.gallery, layoutClass)}>
          {images.map((image, index) => (
            <GalleryFigure key={index} image={image} />
          ))}
        </div>
      </PhotoProvider>
    )
  }

  return (
    <PhotoProvider>
      <div
        className={clsx(css.gallery, css.galleryCarousel)}
        ref={ref}
        onTouchMove={handleCancelAutoplay}
        onWheel={handleCancelAutoplay}
      >
        <div
          className={css.galleryContainer}
          onTouchStart={handleCancelAutoplay}
          onScroll={handleOnScroll}
          ref={setContainerRef}
        >
          {images.map((image, index) => (
            <GalleryFigure
              key={index}
              image={image}
              style={{
                width: `calc(100% - ${IMAGE_CONTAINER_MARGIN_INSET}px)`,
                marginRight: `${CHILD_GAP}px`,
              }}
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
              className={clsx(
                css.galleryIndicator,
                currentIndex === i && css.galleryIndicatorActive,
              )}
              key={i}
              onClick={() => handleScrollTo(i)}
            />
          ))}
        </div>
      </div>
    </PhotoProvider>
  )
}

const GalleryFigure = memo(
  ({ image, style }: { image: GalleryImage; style?: React.CSSProperties }) => {
    const thumbStyle = useThumbhashStyle(image)

    return (
      <PhotoView src={image.src}>
        <figure className={css.galleryItem} style={{ ...thumbStyle, ...style }}>
          <img
            src={image.src}
            alt={image.alt || ''}
            width={image.width}
            height={image.height}
            loading="lazy"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </figure>
      </PhotoView>
    )
  },
)

export default memo(GalleryRenderer)
