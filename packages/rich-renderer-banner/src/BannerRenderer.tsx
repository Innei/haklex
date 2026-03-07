import type { BannerRendererProps } from '@haklex/rich-editor'
import type { LucideProps } from 'lucide-react'
import {
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
} from 'lucide-react'
import type { FC } from 'react'

import * as css from './styles.css'

type BannerType = BannerRendererProps['type']

export const BANNER_ICONS: Record<BannerType, FC<LucideProps>> = {
  note: Info,
  tip: Lightbulb,
  important: MessageSquareWarning,
  warning: TriangleAlert,
  caution: OctagonAlert,
}

export const BANNER_LABELS: Record<BannerType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}

export const ALL_TYPES: BannerType[] = [
  'note',
  'tip',
  'important',
  'warning',
  'caution',
]

export const BannerRenderer: FC<BannerRendererProps> = ({ type }) => {
  const Icon = BANNER_ICONS[type]
  return (
    <span
      className={`${css.bannerIcon} ${css.bannerIconType({ type })} ${css.semanticClassNames.icon} ${css.semanticTypeClassNames.icon[type]}`}
    >
      <Icon width="1em" height="1em" />
    </span>
  )
}

export default BannerRenderer
