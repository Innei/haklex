export interface MentionRendererProps {
  platform: string
  handle: string
}

const platformUrlMap: Record<string, (handle: string) => string> = {
  GH: (handle) => `https://github.com/${encodeURIComponent(handle)}`,
  TW: (handle) => `https://twitter.com/${encodeURIComponent(handle)}`,
}

const platformLabelMap: Record<string, string> = {
  GH: 'GitHub',
  TW: 'Twitter',
}

export function MentionRenderer({ platform, handle }: MentionRendererProps) {
  const urlBuilder = platformUrlMap[platform]

  if (urlBuilder) {
    return (
      <a
        className="rich-mention"
        href={urlBuilder(handle)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="rich-mention-platform">
          {platformLabelMap[platform] || platform}
        </span>
        <span className="rich-mention-handle">@{handle}</span>
      </a>
    )
  }

  return (
    <span className="rich-mention">
      <span className="rich-mention-handle">@{handle}</span>
    </span>
  )
}
