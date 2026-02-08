import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'

import { allNodes } from '../config'
import { AlertPlugin } from '../plugins/AlertPlugin'
import { AutoFocusPlugin } from '../plugins/AutoFocusPlugin'
import { EditorRefPlugin } from '../plugins/EditorRefPlugin'
import { ImagePlugin } from '../plugins/ImagePlugin'
import { KaTeXPlugin } from '../plugins/KaTeXPlugin'
import { MarkdownShortcutsPlugin } from '../plugins/MarkdownShortcutsPlugin'
import { OnChangePlugin } from '../plugins/OnChangePlugin'
import { SubmitShortcutPlugin } from '../plugins/SubmitShortcutPlugin'
import { articleVariant } from '../styles/article.css'
import { commentVariant } from '../styles/comment.css'
import { editorTheme } from '../styles/theme'
import type { RichEditorProps } from '../types'
import { ContentEditable } from './ContentEditable'
import { clsx } from './utils'

export function RichEditor({
  initialValue,
  onChange,
  variant = 'article',
  placeholder = 'Write something...',
  onSubmit,
  autoFocus = false,
  className,
  contentClassName,
  actions,
  onEditorReady,
  extraNodes,
}: RichEditorProps) {
  const nodes = extraNodes ? [...allNodes, ...extraNodes] : allNodes
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

  const variantClass = variant === 'article' ? articleVariant : commentVariant

  return (
    <LexicalComposer initialConfig={initialConfig}>
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
        <OnChangePlugin onChange={onChange} />
        <SubmitShortcutPlugin onSubmit={onSubmit} />
        <ImagePlugin />
        <KaTeXPlugin />
        <AlertPlugin />
        <EditorRefPlugin onEditorReady={onEditorReady} />
        {autoFocus && <AutoFocusPlugin />}
        {actions && <div className="rich-editor__actions">{actions}</div>}
      </div>
    </LexicalComposer>
  )
}
