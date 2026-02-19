import { useCallback, useEffect, useMemo, useState } from 'react'

import { decodeThumbHash } from '../../utils/thumbhash'

export interface ImageRendererProps {
  src: string
  altText: string
  width?: number
  height?: number
  caption?: string
  thumbhash?: string
  accent?: string
}

export function ImageRenderer({
  src,
  altText,
  width,
  height,
  caption,
  thumbhash,
  accent,
}: ImageRendererProps) {
  const [loaded, setLoaded] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const handleLoad = useCallback(() => setLoaded(true), [])

  const handleZoomOpen = useCallback(() => {
    if (!loaded) return
    setZoomed(true)
  }, [loaded])

  const handleZoomClose = useCallback(() => setZoomed(false), [])

  useEffect(() => {
    if (!zoomed) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [zoomed])

  useEffect(() => {
    if (!zoomed) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [zoomed])

  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && loaded) {
        e.preventDefault()
        setZoomed(true)
      }
    },
    [loaded],
  )

  const placeholderUrl = useMemo(
    () => (thumbhash ? decodeThumbHash(thumbhash) : undefined),
    [thumbhash],
  )

  const aspectStyle: React.CSSProperties =
    width && height
      ? { aspectRatio: `${width} / ${height}`, maxWidth: '100%', width }
      : { maxWidth: '100%' }

  return (
    <figure className="rich-image">
      <div
        className={`rich-image-container${loaded ? ' rich-image-loaded' : ''}`}
        style={{
          ...aspectStyle,
          backgroundColor: !loaded && !placeholderUrl ? accent : undefined,
          backgroundImage:
            !loaded && placeholderUrl ? `url(${placeholderUrl})` : undefined,
          backgroundSize: 'cover',
          cursor: loaded ? 'zoom-in' : undefined,
        }}
        onClick={handleZoomOpen}
        onKeyDown={handleContainerKeyDown}
        role="button"
        tabIndex={loaded ? 0 : -1}
        aria-label={loaded ? `Zoom image: ${altText}` : undefined}
      >
        <img
          src={src}
          alt={altText}
          width={width}
          height={height}
          loading="lazy"
          onLoad={handleLoad}
          style={{ maxWidth: '100%', height: 'auto' }}
          className={loaded ? 'rich-image-visible' : 'rich-image-hidden'}
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}

      {zoomed && (
        <div
          className="rich-image-zoom-overlay"
          onClick={handleZoomClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed image: ${altText}`}
          tabIndex={0}
        >
          <img src={src} alt={altText} className="rich-image-zoom-img" />
        </div>
      )}
    </figure>
  )
}
