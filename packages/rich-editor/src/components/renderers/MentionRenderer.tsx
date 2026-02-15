export interface MentionRendererProps {
  platform: string
  handle: string
  displayName?: string
}

export function MentionRenderer({ handle, displayName }: MentionRendererProps) {
  const normalizedHandle = handle.replace(/^@+/, '')
  const label = displayName || normalizedHandle

  return (
    <span className="rich-mention rich-mention-plain">
      <span className="rich-mention-handle">@{label}</span>
    </span>
  )
}
