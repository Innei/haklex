import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { LexicalEditor } from 'lexical'
import { $getNodeByKey } from 'lexical'
import { useCallback } from 'react'

import type { BannerType } from '../../nodes/BannerNode'
import { $isBannerNode } from '../../nodes/BannerNode'
import { BannerRenderer } from '../renderers/BannerRenderer'
import { RendererWrapper } from '../RendererWrapper'

interface BannerEditDecoratorProps {
  nodeKey: string
  bannerType: BannerType
  contentEditor: LexicalEditor
}

export function BannerEditDecorator({
  nodeKey,
  bannerType,
  contentEditor,
}: BannerEditDecoratorProps) {
  const [editor] = useLexicalComposerContext()
  const editable = editor.isEditable()

  const handleTypeChange = useCallback(
    (newType: BannerType) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isBannerNode(node)) {
          node.setBannerType(newType)
        }
      })
    },
    [editor, nodeKey],
  )

  return (
    <div className="rich-banner-inner">
      <RendererWrapper
        rendererKey="Banner"
        defaultRenderer={BannerRenderer}
        props={{
          type: bannerType,
          editable,
          onTypeChange: editable ? handleTypeChange : undefined,
        }}
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
          <ListPlugin />
          <LinkPlugin />
        </LexicalNestedComposer>
      </div>
    </div>
  )
}
