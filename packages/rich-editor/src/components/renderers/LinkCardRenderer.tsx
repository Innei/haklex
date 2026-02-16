export interface LinkCardRendererProps {
  url: string
  source?: string
  id?: string
  title?: string
  description?: string
  favicon?: string
  image?: string
}

export function LinkCardRenderer({
  url,
  title,
  description,
  favicon,
  image,
}: LinkCardRendererProps) {
  const displayTitle = title || url

  return (
    <a
      className="rich-link-card"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {image && (
        <span className="rich-link-card-image">
          <img src={image} alt="" loading="lazy" />
        </span>
      )}
      <span className="rich-link-card-content">
        <span className="rich-link-card-title">
          {favicon && (
            <img
              className="rich-link-card-favicon"
              src={favicon}
              alt=""
              width={16}
              height={16}
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          {displayTitle}
        </span>
        {description && (
          <span className="rich-link-card-description">{description}</span>
        )}
        <span className="rich-link-card-url">{url}</span>
      </span>
    </a>
  )
}
