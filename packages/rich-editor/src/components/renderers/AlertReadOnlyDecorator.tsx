import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { LexicalEditor } from 'lexical'

import type { AlertType } from '../../nodes/AlertQuoteNode'
import { RendererWrapper } from '../RendererWrapper'
import { AlertRenderer } from './AlertRenderer'

interface AlertReadOnlyDecoratorProps {
  alertType: AlertType
  contentEditor: LexicalEditor
}

export function AlertReadOnlyDecorator({
  alertType,
  contentEditor,
}: AlertReadOnlyDecoratorProps) {
  return (
    <>
      <RendererWrapper
        rendererKey="Alert"
        defaultRenderer={AlertRenderer}
        props={{ type: alertType }}
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
        </LexicalNestedComposer>
      </div>
    </>
  )
}
