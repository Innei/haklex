import type {
  Klass,
  LexicalEditor,
  LexicalNode,
  SerializedEditorState,
} from 'lexical'
import type { ReactNode } from 'react'

import type { ColorScheme } from './context/ColorSchemeContext'
import type { RendererConfig } from './types/renderer-config'

export type RichEditorVariant = 'article' | 'comment' | 'note'

export interface RichEditorProps {
  initialValue?: SerializedEditorState
  onChange?: (value: SerializedEditorState) => void
  variant?: RichEditorVariant
  theme?: ColorScheme
  placeholder?: string
  onSubmit?: () => void
  autoFocus?: boolean
  className?: string
  contentClassName?: string
  style?: React.CSSProperties
  actions?: ReactNode
  onEditorReady?: (editor: LexicalEditor | null) => void
  extraNodes?: Array<Klass<LexicalNode>>
  rendererConfig?: RendererConfig
  debounceMs?: number
  children?: ReactNode
}

export interface RichRendererProps {
  value: SerializedEditorState
  variant?: RichEditorVariant
  theme?: ColorScheme
  className?: string
  style?: React.CSSProperties
  as?: React.ElementType
  rendererConfig?: RendererConfig
  extraNodes?: Array<Klass<LexicalNode>>
}
