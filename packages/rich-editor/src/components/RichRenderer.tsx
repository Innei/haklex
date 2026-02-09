import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'

import { allNodes } from '../config'
import { RendererConfigProvider } from '../context/RendererConfigContext'
import { articleVariant } from '../styles/article.css'
import { commentVariant } from '../styles/comment.css'
import { editorTheme } from '../styles/theme'
import type { RichRendererProps } from '../types'
import { clsx } from './utils'

export function RichRenderer({
  value,
  variant = 'article',
  className,
  as: Component = 'div',
  rendererConfig,
}: RichRendererProps) {
  const variantClass = variant === 'article' ? articleVariant : commentVariant

  const initialConfig = {
    namespace: 'RichRenderer',
    theme: editorTheme,
    nodes: allNodes,
    editable: false,
    editorState: JSON.stringify(value),
    onError: (error: Error) => {
      console.error('[RichRenderer]', error)
    },
  }

  return (
    <RendererConfigProvider config={rendererConfig}>
      <Component className={clsx('rich-content', variantClass, className)}>
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="rich-content__body"
                style={{ outline: 'none' }}
                aria-placeholder=""
                placeholder={<span style={{ display: 'none' }} />}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalComposer>
      </Component>
    </RendererConfigProvider>
  )
}
