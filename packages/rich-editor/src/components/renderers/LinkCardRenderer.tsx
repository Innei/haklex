export interface LinkCardRendererProps {
  description?: string;
  favicon?: string;
  id?: string;
  image?: string;
  source?: string;
  title?: string;
  url: string;
}

export function LinkCardRenderer({
  url,
  title,
  description,
  favicon,
  image,
}: LinkCardRendererProps) {
  const displayTitle = title || url;

  return (
    <a className="rich-link-card" href={url} rel="noopener noreferrer" target="_blank">
      {image && (
        <span className="rich-link-card-image">
          <img alt="" loading="lazy" src={image} />
        </span>
      )}
      <span className="rich-link-card-content">
        <span className="rich-link-card-title">
          {favicon && (
            <img
              alt=""
              className="rich-link-card-favicon"
              height={16}
              src={favicon}
              width={16}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {displayTitle}
        </span>
        {description && <span className="rich-link-card-description">{description}</span>}
        <span className="rich-link-card-url">{url}</span>
      </span>
    </a>
  );
}
