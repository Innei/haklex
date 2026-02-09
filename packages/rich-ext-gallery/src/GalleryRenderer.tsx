import './styles.css'
import 'react-photo-view/dist/react-photo-view.css'

import type { GalleryRendererProps } from '@shiro/rich-editor'
import type { ComponentType, UIEventHandler } from 'react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { PhotoProvider, PhotoView } from 'react-photo-view'

const IMAGE_CONTAINER_MARGIN_INSET = 60
const CHILD_GAP = 15
const AUTOPLAY_DURATION = 5000

function throttle<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: Parameters<T>) => {
    if (!timeout) {
      timeout = setTimeout(() => {
        func(...args)
        timeout = null
      }, wait)
    }
  }) as T
}

/**
 * Enhanced Gallery Renderer for @shiro/rich-editor
 * Supports carousel mode with autoplay and photo zoom
 */
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

  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null)
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

  // Single image mode
  if (images.length === 1 || layout === 'grid' || layout === 'masonry') {
    return (
      <PhotoProvider>
        <div className={`gallery gallery--${layout}`}>
          {images.map((image, index) => (
            <PhotoView key={index} src={image.src}>
              <figure className="gallery__item">
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
          ))}
        </div>
      </PhotoProvider>
    )
  }

  // Carousel mode
  return (
    <PhotoProvider>
      <div
        className="gallery gallery--carousel"
        ref={ref}
        onTouchMove={handleCancelAutoplay}
        onWheel={handleCancelAutoplay}
      >
        <div
          className="gallery__container"
          onTouchStart={handleCancelAutoplay}
          onScroll={handleOnScroll}
          ref={setContainerRef}
        >
          {images.map((image, index) => (
            <PhotoView key={index} src={image.src}>
              <figure
                className="gallery__item"
                style={{
                  width: `calc(100% - ${IMAGE_CONTAINER_MARGIN_INSET}px)`,
                  marginRight: `${CHILD_GAP}px`,
                }}
              >
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
          ))}
        </div>

        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            className="gallery__nav gallery__nav--prev"
            onClick={() => handleScrollTo(currentIndex - 1)}
          >
            ←
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button
            className="gallery__nav gallery__nav--next"
            onClick={() => handleScrollTo(currentIndex + 1)}
          >
            →
          </button>
        )}

        {/* Indicators */}
        <div className="gallery__indicators">
          {images.map((_, i) => (
            <div
              className={`gallery__indicator ${currentIndex === i ? 'gallery__indicator--active' : ''}`}
              key={i}
              onClick={() => handleScrollTo(i)}
            />
          ))}
        </div>
      </div>
    </PhotoProvider>
  )
}

export default memo(GalleryRenderer)
