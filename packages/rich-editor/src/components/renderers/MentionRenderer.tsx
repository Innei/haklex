export interface MentionRendererProps {
  platform: string
  handle: string
  displayName?: string
}

const platformUrlMap: Record<string, (handle: string) => string> = {
  GH: (handle) => `https://github.com/${encodeURIComponent(handle)}`,
  TW: (handle) => `https://twitter.com/${encodeURIComponent(handle)}`,
  TG: (handle) => `https://t.me/${encodeURIComponent(handle)}`,
}

const platformLabelMap: Record<string, string> = {
  GH: 'GitHub',
  TW: 'Twitter',
  TG: 'Telegram',
}

export function MentionRenderer({
  platform,
  handle,
  displayName,
}: MentionRendererProps) {
  const urlBuilder = platformUrlMap[platform]
  const label = displayName || `@${handle}`

  if (urlBuilder) {
    return (
      <a
        className="rich-mention"
        href={urlBuilder(handle)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {!displayName && (
          <span className="rich-mention-platform">
            {platformLabelMap[platform] || platform}
          </span>
        )}
        <span className="rich-mention-handle">{label}</span>
      </a>
    )
  }

  return (
    <span className="rich-mention">
      <span className="rich-mention-handle">{label}</span>
    </span>
  )
}
