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
import { RendererConfigProvider } from '../context/RendererConfigContext'
import { setResolvedEditNodes } from '../node-registry'
import { AlertPlugin } from '../plugins/AlertPlugin'
import { AutoFocusPlugin } from '../plugins/AutoFocusPlugin'
import { AutoLinkPlugin } from '../plugins/AutoLinkPlugin'
import { EditorRefPlugin } from '../plugins/EditorRefPlugin'
import { FootnotePlugin } from '../plugins/FootnotePlugin'
import { HorizontalRulePlugin } from '../plugins/HorizontalRulePlugin'
import { ImagePlugin } from '../plugins/ImagePlugin'
import { KaTeXPlugin } from '../plugins/KaTeXPlugin'
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
  actions,
  onEditorReady,
  extraNodes,
  rendererConfig,
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

  const variantClass = getVariantClass(variant, theme)

  return (
    <PortalThemeProvider className={variantClass}>
      <ColorSchemeProvider colorScheme={theme}>
        <RendererConfigProvider config={rendererConfig} mode="editor">
          <LexicalComposer initialConfig={initialConfig}>
            <FootnotePlugin>
              <div className={clsx('rich-editor', variantClass, className)}>
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className={contentClassName}
                      placeholder={placeholder}
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
                <OnChangePlugin onChange={onChange} debounceMs={debounceMs} />
                <SubmitShortcutPlugin onSubmit={onSubmit} />
                <ImagePlugin />
                <KaTeXPlugin />
                <AlertPlugin />
                <MermaidPlugin />
                <HorizontalRulePlugin />
                <CheckListPlugin />
                <AutoLinkPlugin />
                <EditorRefPlugin onEditorReady={onEditorReady} />
                {autoFocus && <AutoFocusPlugin />}
                {children}
                {actions && (
                  <div className="rich-editor__actions">{actions}</div>
                )}
              </div>
            </FootnotePlugin>
          </LexicalComposer>
        </RendererConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  )
}
