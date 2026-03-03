import { PortalThemeProvider } from '@haklex/rich-style-token'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'

import { allEditNodes } from '../config-edit'
import { ColorSchemeProvider } from '../context/ColorSchemeContext'
import { ImageUploadProvider } from '../context/ImageUploadContext'
import { RendererConfigProvider } from '../context/RendererConfigContext'
import { setResolvedEditNodes } from '../node-registry'
import { AlertPlugin } from '../plugins/AlertPlugin'
import { AutoFocusPlugin } from '../plugins/AutoFocusPlugin'
import { AutoLinkPlugin } from '../plugins/AutoLinkPlugin'
import { BlockExitPlugin } from '../plugins/BlockExitPlugin'
import { BlockIdPlugin } from '../plugins/BlockIdPlugin'
import { EditorRefPlugin } from '../plugins/EditorRefPlugin'
import { FootnotePlugin } from '../plugins/FootnotePlugin'
import { HorizontalRulePlugin } from '../plugins/HorizontalRulePlugin'
import { ImagePlugin } from '../plugins/ImagePlugin'
import {
  defaultImageUpload,
  ImageUploadPlugin,
} from '../plugins/ImageUploadPlugin'
import { KaTeXPlugin } from '../plugins/KaTeXPlugin'
import { LinkFaviconPlugin } from '../plugins/LinkFaviconPlugin'
import { MarkdownPastePlugin } from '../plugins/MarkdownPastePlugin'
import { MarkdownShortcutsPlugin } from '../plugins/MarkdownShortcutsPlugin'
import { MermaidPlugin } from '../plugins/MermaidPlugin'
import { OnChangePlugin } from '../plugins/OnChangePlugin'
import { SubmitShortcutPlugin } from '../plugins/SubmitShortcutPlugin'
import { editorTheme } from '../styles/theme'
import type { RichEditorProps } from '../types'
import { ContentEditable } from './ContentEditable'
import { clsx, getVariantClass } from './utils'

export function RichEditor({
  initialValue,
  onChange,
  variant = 'article',
  theme = 'light',
  placeholder = 'Write something...',
  onSubmit,
  autoFocus = false,
  className,
  contentClassName,
  style,
  actions,
  header,
  onEditorReady,
  extraNodes,
  rendererConfig,
  imageUpload,
  debounceMs,
  children,
}: RichEditorProps) {
  const nodes = extraNodes ? [...allEditNodes, ...extraNodes] : allEditNodes
  setResolvedEditNodes(nodes)
  const initialConfig = {
    namespace: 'RichEditor',
    theme: editorTheme,
    nodes,
    editable: true,
    onError: (error: Error) => {
      console.error('[RichEditor]', error)
    },
    ...(initialValue ? { editorState: JSON.stringify(initialValue) } : {}),
  }

  const variantClass = getVariantClass(variant)
  const resolvedImageUpload = imageUpload ?? defaultImageUpload

  return (
    <PortalThemeProvider className={variantClass} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <RendererConfigProvider
          config={rendererConfig}
          mode="editor"
          variant={variant}
        >
          <ImageUploadProvider upload={resolvedImageUpload}>
            <LexicalComposer initialConfig={initialConfig}>
              <FootnotePlugin>
                <div
                  className={clsx('rich-editor', variantClass, className)}
                  style={{ ...style, maxWidth: 'none' }}
                  data-theme={theme}
                  suppressHydrationWarning
                >
                  {header}
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable
                        className={contentClassName}
                        placeholder={placeholder}
                        hasHeader={!!header}
                      />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <HistoryPlugin />
                  <ListPlugin />
                  <LinkPlugin />
                  <TabIndentationPlugin />
                  <TablePlugin />
                  <MarkdownShortcutsPlugin />
                  <MarkdownPastePlugin />
                  <OnChangePlugin onChange={onChange} debounceMs={debounceMs} />
                  <SubmitShortcutPlugin onSubmit={onSubmit} />
                  <ImagePlugin />
                  <ImageUploadPlugin onUpload={resolvedImageUpload} />
                  <KaTeXPlugin />
                  <AlertPlugin />
                  <MermaidPlugin />
                  <HorizontalRulePlugin />
                  <CheckListPlugin />
                  <BlockExitPlugin />
                  <AutoLinkPlugin />
                  <LinkFaviconPlugin />
                  <BlockIdPlugin />
                  <EditorRefPlugin onEditorReady={onEditorReady} />
                  {autoFocus && <AutoFocusPlugin />}
                  {children}
                  {actions && (
                    <div className="rich-editor__actions">{actions}</div>
                  )}
                </div>
              </FootnotePlugin>
            </LexicalComposer>
          </ImageUploadProvider>
        </RendererConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  )
}
