import type {
  Klass,
  LexicalEditor,
  LexicalNode,
  SerializedEditorState,
} from 'lexical'
import type { ReactNode } from 'react'

export type RichEditorVariant = 'article' | 'comment'

export interface RichEditorProps {
  initialValue?: SerializedEditorState
  onChange?: (value: SerializedEditorState) => void
  variant?: RichEditorVariant
  placeholder?: string
  onSubmit?: () => void
  autoFocus?: boolean
  className?: string
  contentClassName?: string
  actions?: ReactNode
  onEditorReady?: (editor: LexicalEditor | null) => void
  extraNodes?: Array<Klass<LexicalNode>>
}

export interface RichRendererProps {
  value: SerializedEditorState
  variant?: RichEditorVariant
  className?: string
  as?: React.ElementType
}
