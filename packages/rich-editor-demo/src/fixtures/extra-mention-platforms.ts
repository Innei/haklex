import type { MentionPlatformMeta } from '@haklex/rich-kit-shiro'
import {
  SiBilibili,
  SiDiscord,
  SiMastodon,
  SiReddit,
  SiYoutube,
} from '@icons-pack/react-simple-icons'
import { createElement } from 'react'

export interface ExtraMentionPlatformDef {
  key: string
  label: string
  icon: React.ReactNode
  getUrl: (handle: string) => string
}

export const extraMentionPlatforms: ExtraMentionPlatformDef[] = [
  {
    key: 'DC',
    label: 'Discord',
    icon: createElement(SiDiscord, { size: '1em', color: '#5865F2' }),
    getUrl: (h) => `https://discord.com/users/${encodeURIComponent(h)}`,
  },
  {
    key: 'YT',
    label: 'YouTube',
    icon: createElement(SiYoutube, { size: '1em', color: '#FF0000' }),
    getUrl: (h) => `https://youtube.com/@${encodeURIComponent(h)}`,
  },
  {
    key: 'BB',
    label: 'Bilibili',
    icon: createElement(SiBilibili, { size: '1em', color: '#00A1D6' }),
    getUrl: (h) => `https://space.bilibili.com/${encodeURIComponent(h)}`,
  },
  {
    key: 'RD',
    label: 'Reddit',
    icon: createElement(SiReddit, { size: '1em', color: '#FF4500' }),
    getUrl: (h) => `https://reddit.com/u/${encodeURIComponent(h)}`,
  },
  {
    key: 'MD',
    label: 'Mastodon',
    icon: createElement(SiMastodon, { size: '1em', color: '#6364FF' }),
    getUrl: (h) => `https://mastodon.social/@${encodeURIComponent(h)}`,
  },
]

export const allExtraPlatformMeta: Record<string, MentionPlatformMeta> =
  Object.fromEntries(
    extraMentionPlatforms.map((p) => [
      p.key,
      { label: p.label, icon: p.icon, getUrl: p.getUrl },
    ]),
  )
