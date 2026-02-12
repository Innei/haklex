export interface MentionRendererProps {
  platform: string
  handle: string
  displayName?: string
}

interface MentionPlatformMeta {
  label: string
  icon: React.ReactNode
  getUrl: (handle: string) => string
}

const GitHubIcon = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 15 15"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.5 0C3.35625 0 0 3.35625 0 7.5C0 10.8187 2.14687 13.6219 5.12812 14.6156C5.50312 14.6813 5.64375 14.4563 5.64375 14.2594C5.64375 14.0813 5.63438 13.4906 5.63438 12.8625C3.75 13.2094 3.2625 12.4031 3.1125 11.9812C3.02812 11.7656 2.6625 11.1 2.34375 10.9219C2.08125 10.7812 1.70625 10.4344 2.33438 10.425C2.925 10.4156 3.34688 10.9687 3.4875 11.1937C4.1625 12.3281 5.24063 12.0094 5.67188 11.8125C5.7375 11.325 5.93437 10.9969 6.15 10.8094C4.48125 10.6219 2.7375 9.975 2.7375 7.10625C2.7375 6.29062 3.02813 5.61562 3.50625 5.09062C3.43125 4.90312 3.16875 4.13437 3.58125 3.10312C3.58125 3.10312 4.20938 2.90625 5.64375 3.87188C6.24375 3.70313 6.88125 3.61875 7.51875 3.61875C8.15625 3.61875 8.79375 3.70313 9.39375 3.87188C10.8281 2.89688 11.4563 3.10312 11.4563 3.10312C11.8688 4.13437 11.6063 4.90312 11.5313 5.09062C12.0094 5.61562 12.3 6.28125 12.3 7.10625C12.3 9.98437 10.5469 10.6219 8.87813 10.8094C9.15 11.0437 9.38438 11.4938 9.38438 12.1969C9.38438 13.2 9.375 14.0063 9.375 14.2594C9.375 14.4563 9.51563 14.6906 9.89063 14.6156C12.8531 13.6219 15 10.8094 15 7.5C15 3.35625 11.6438 0 7.5 0Z"
      className="rich-mention-icon-gh"
    />
  </svg>
)

const TwitterIcon = (
  <svg width="1em" height="1em" viewBox="0 0 24 24">
    <path
      fill="#1DA1F2"
      d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23Z"
    />
  </svg>
)

const TelegramIcon = (
  <svg width="1em" height="1em" viewBox="0 0 24 24">
    <path
      fill="#2AABEE"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19c-.14.75-.42 1-.68 1.03c-.58.05-1.02-.38-1.58-.75c-.88-.58-1.38-.94-2.23-1.5c-.99-.65-.35-1.01.22-1.59c.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02c-.09.02-1.49.95-4.22 2.79c-.4.27-.76.41-1.08.4c-.36-.01-1.04-.2-1.55-.37c-.63-.2-1.12-.31-1.08-.66c.02-.18.27-.36.74-.55c2.92-1.27 4.86-2.11 5.83-2.51c2.78-1.16 3.35-1.36 3.73-1.36c.08 0 .27.02.39.12c.1.08.13.19.14.27c-.01.06.01.24 0 .38z"
    />
  </svg>
)

const ZhihuIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
  >
    <path
      fill="#0084FF"
      d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0zm1.964 4.078c-.271.73-.5 1.434-.68 2.11h4.587c.545-.006.445 1.168.445 1.171H9.384a58.104 58.104 0 0 1-.112 3.797h2.712c.388.023.393 1.251.393 1.266H9.183a9.223 9.223 0 0 1-.408 2.102l.757-.604c.452.456 1.512 1.712 1.906 2.177c.473.681.063 2.081.063 2.081l-2.794-3.382c-.653 2.518-1.845 3.607-1.845 3.607c-.523.468-1.58.82-2.64.516c2.218-1.73 3.44-3.917 3.667-6.497H4.491c0-.015.197-1.243.806-1.266h2.71c.024-.32.086-3.254.086-3.797H6.598c-.136.406-.158.447-.268.753c-.594 1.095-1.603 1.122-1.907 1.155c.906-1.821 1.416-3.6 1.591-4.064c.425-1.124 1.671-1.125 1.671-1.125zM13.078 6h6.377v11.33h-2.573l-2.184 1.373l-.401-1.373h-1.219zm1.313 1.219v8.86h.623l.263.937l1.455-.938h1.456v-8.86z"
    />
  </svg>
)

const platformMetaMap: Record<string, MentionPlatformMeta> = {
  GH: {
    label: 'GitHub',
    icon: GitHubIcon,
    getUrl: (handle) => `https://github.com/${encodeURIComponent(handle)}`,
  },
  TW: {
    label: 'Twitter',
    icon: TwitterIcon,
    getUrl: (handle) => `https://twitter.com/${encodeURIComponent(handle)}`,
  },
  TG: {
    label: 'Telegram',
    icon: TelegramIcon,
    getUrl: (handle) => `https://t.me/${encodeURIComponent(handle)}`,
  },
  ZH: {
    label: 'Zhihu',
    icon: ZhihuIcon,
    getUrl: (handle) =>
      `https://www.zhihu.com/people/${encodeURIComponent(handle)}`,
  },
}

export function MentionRenderer({
  platform,
  handle,
  displayName,
}: MentionRendererProps) {
  const normalizedHandle = handle.replace(/^@+/, '')
  const meta = platformMetaMap[platform]
  const label = displayName || normalizedHandle

  if (meta) {
    return (
      <span className="rich-mention">
        <span className="rich-mention-icon" aria-hidden>
          {meta.icon}
        </span>
        <a
          className="rich-mention-handle"
          href={meta.getUrl(normalizedHandle)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      </span>
    )
  }

  return (
    <span className="rich-mention rich-mention-plain">
      <span className="rich-mention-handle">{label}</span>
    </span>
  )
}
