import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'

import { allNodes } from '../config'
import { ColorSchemeProvider } from '../context/ColorSchemeContext'
import { RendererConfigProvider } from '../context/RendererConfigContext'
import { HeadingAnchorPlugin } from '../plugins/HeadingAnchorPlugin'
import { editorTheme } from '../styles/theme'
import type { RichRendererProps } from '../types'
import { clsx, getVariantClass } from './utils'

export function RichRenderer({
  value,
  variant = 'article',
  colorScheme = 'light',
  className,
  as: Component = 'div',
  rendererConfig,
}: RichRendererProps) {
  const variantClass = getVariantClass(variant, colorScheme)

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
    <ColorSchemeProvider colorScheme={colorScheme}>
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
            <HeadingAnchorPlugin />
          </LexicalComposer>
        </Component>
      </RendererConfigProvider>
    </ColorSchemeProvider>
  )
}
