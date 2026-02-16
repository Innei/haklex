import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { LexicalEditor } from 'lexical'

import type { BannerType } from '../../nodes/BannerNode'
import { RendererWrapper } from '../RendererWrapper'
import { BannerRenderer } from './BannerRenderer'

interface BannerReadOnlyDecoratorProps {
  bannerType: BannerType
  contentEditor: LexicalEditor
}

export function BannerReadOnlyDecorator({
  bannerType,
  contentEditor,
}: BannerReadOnlyDecoratorProps) {
  return (
    <div className="rich-banner-inner">
      <RendererWrapper
        rendererKey="Banner"
        defaultRenderer={BannerRenderer}
        props={{ type: bannerType }}
      />
      <div className="rich-banner-content">
        <LexicalNestedComposer initialEditor={contentEditor}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="rich-banner-content-editable"
                style={{ outline: 'none' }}
                aria-placeholder=""
                placeholder={<span style={{ display: 'none' }} />}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalNestedComposer>
      </div>
    </div>
  )
}
