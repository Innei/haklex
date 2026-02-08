export interface ImageRendererProps {
  src: string
  altText: string
  width?: number
  height?: number
  caption?: string
}

export function ImageRenderer({
  src,
  altText,
  width,
  height,
  caption,
}: ImageRendererProps) {
  return (
    <figure className="rich-image">
      <img
        src={src}
        alt={altText}
        width={width}
        height={height}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
