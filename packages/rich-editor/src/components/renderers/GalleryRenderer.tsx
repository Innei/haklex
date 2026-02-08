import type { GalleryImage } from '../../nodes/GalleryNode'

export interface GalleryRendererProps {
  images: GalleryImage[]
  layout: 'grid' | 'masonry' | 'carousel'
}

export function GalleryRenderer({ images, layout }: GalleryRendererProps) {
  if (images.length === 0) return null

  return (
    <div className={`rich-gallery rich-gallery-${layout}`}>
      {images.map((image, index) => (
        <figure key={index} className="rich-gallery-item">
          <img
            src={image.src}
            alt={image.alt || ''}
            width={image.width}
            height={image.height}
            loading="lazy"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </figure>
      ))}
    </div>
  )
}
