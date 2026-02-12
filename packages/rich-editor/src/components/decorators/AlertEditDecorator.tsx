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

import type { AlertType } from '../../nodes/AlertQuoteNode'
import { $isAlertQuoteNode } from '../../nodes/AlertQuoteNode'
import { AlertRenderer } from '../renderers/AlertRenderer'
import { RendererWrapper } from '../RendererWrapper'

interface AlertEditDecoratorProps {
  nodeKey: string
  alertType: AlertType
  contentEditor: LexicalEditor
}

export function AlertEditDecorator({
  nodeKey,
  alertType,
  contentEditor,
}: AlertEditDecoratorProps) {
  const [editor] = useLexicalComposerContext()
  const editable = editor.isEditable()

  const handleTypeChange = useCallback(
    (newType: AlertType) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isAlertQuoteNode(node)) {
          node.setAlertType(newType)
        }
      })
    },
    [editor, nodeKey],
  )

  return (
    <>
      <RendererWrapper
        rendererKey="Alert"
        defaultRenderer={AlertRenderer}
        props={{
          type: alertType,
          editable,
          onTypeChange: editable ? handleTypeChange : undefined,
        }}
      />
      <div className="rich-alert-content">
        <LexicalNestedComposer initialEditor={contentEditor}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="rich-alert-content-editable"
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
    </>
  )
}
