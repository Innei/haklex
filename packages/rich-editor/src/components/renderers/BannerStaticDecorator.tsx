import type { SerializedEditorState } from 'lexical'

import { useNestedContentRenderer } from '../../context/NestedContentRendererContext'
import type { BannerType } from '../../nodes/BannerNode'
import { RendererWrapper } from '../RendererWrapper'
import { BannerRenderer } from './BannerRenderer'

interface BannerStaticDecoratorProps {
  bannerType: BannerType
  contentState: SerializedEditorState
}

export function BannerStaticDecorator({
  bannerType,
  contentState,
}: BannerStaticDecoratorProps) {
  const renderContent = useNestedContentRenderer()

  return (
    <div className="rich-banner-inner">
      <RendererWrapper
        rendererKey="Banner"
        defaultRenderer={BannerRenderer}
        props={{ type: bannerType }}
      />
      <div className="rich-banner-content">{renderContent(contentState)}</div>
    </div>
  )
}
