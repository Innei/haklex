export interface VideoRendererProps {
  src: string
  poster?: string
  width?: number
  height?: number
}

export function VideoRenderer({
  src,
  poster,
  width,
  height,
}: VideoRendererProps) {
  return (
    <figure className="rich-video">
      <video
        src={src}
        poster={poster}
        width={width}
        height={height}
        controls
        preload="metadata"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </figure>
  )
}
