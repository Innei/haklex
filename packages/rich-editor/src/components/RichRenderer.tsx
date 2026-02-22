import { PortalThemeProvider } from '@haklex/rich-style-token'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'

import { allNodes } from '../config'
import { ColorSchemeProvider } from '../context/ColorSchemeContext'
import { RendererConfigProvider } from '../context/RendererConfigContext'
import { FootnotePlugin } from '../plugins/FootnotePlugin'
import { HeadingAnchorPlugin } from '../plugins/HeadingAnchorPlugin'
import { editorTheme } from '../styles/theme'
import type { RichRendererProps } from '../types'
import { clsx, getVariantClass } from './utils'

export function RichRenderer({
  value,
  variant = 'article',
  theme = 'light',
  className,
  style,
  as: Component = 'div',
  rendererConfig,
  extraNodes,
}: RichRendererProps) {
  const variantClass = getVariantClass(variant, theme)

  const nodes = extraNodes ? [...allNodes, ...extraNodes] : allNodes

  const initialConfig = {
    namespace: 'RichRenderer',
    theme: editorTheme,
    nodes,
    editable: false,
    editorState: JSON.stringify(value),
    onError: (error: Error) => {
      console.error('[RichRenderer]', error)
    },
  }

  return (
    <PortalThemeProvider className={variantClass}>
      <ColorSchemeProvider colorScheme={theme}>
        <RendererConfigProvider config={rendererConfig} mode="renderer">
          <Component
            className={clsx('rich-content', variantClass, className)}
            style={style}
          >
            <LexicalComposer initialConfig={initialConfig}>
              <FootnotePlugin>
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
              </FootnotePlugin>
            </LexicalComposer>
          </Component>
        </RendererConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  )
}
