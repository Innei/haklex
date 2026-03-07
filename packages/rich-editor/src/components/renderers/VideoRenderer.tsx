export interface VideoRendererProps {
  height?: number;
  poster?: string;
  src: string;
  width?: number;
}

export function VideoRenderer({ src, poster, width, height }: VideoRendererProps) {
  return (
    <figure className="rich-video">
      <video
        controls
        height={height}
        poster={poster}
        preload="metadata"
        src={src}
        style={{ maxWidth: '100%', height: 'auto' }}
        width={width}
      />
    </figure>
  );
}
