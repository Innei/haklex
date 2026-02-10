import type {
  Klass,
  LexicalEditor,
  LexicalNode,
  SerializedEditorState,
} from 'lexical'
import type { ReactNode } from 'react'

import type { ColorScheme } from './context/ColorSchemeContext'
import type { RendererConfig } from './types/renderer-config'

export type RichEditorVariant = 'article' | 'comment'

export interface RichEditorProps {
  initialValue?: SerializedEditorState
  onChange?: (value: SerializedEditorState) => void
  variant?: RichEditorVariant
  colorScheme?: ColorScheme
  placeholder?: string
  onSubmit?: () => void
  autoFocus?: boolean
  className?: string
  contentClassName?: string
  actions?: ReactNode
  onEditorReady?: (editor: LexicalEditor | null) => void
  extraNodes?: Array<Klass<LexicalNode>>
  rendererConfig?: RendererConfig
  debounceMs?: number
}

export interface RichRendererProps {
  value: SerializedEditorState
  variant?: RichEditorVariant
  colorScheme?: ColorScheme
  className?: string
  as?: React.ElementType
  rendererConfig?: RendererConfig
}
