import type { FC } from 'react'

import type { BannerType } from '../../nodes/BannerNode'

export interface BannerRendererProps {
  type: BannerType
  editable?: boolean
  onTypeChange?: (type: BannerType) => void
}

export const BannerRenderer: FC<BannerRendererProps> = ({ type }) => {
  return <span className={`rich-banner-icon rich-banner-icon-${type}`} />
}
