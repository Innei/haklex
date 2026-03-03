import type {
  Klass,
  LexicalEditor,
  LexicalNode,
  SerializedEditorState,
} from 'lexical'
import type { ReactNode } from 'react'

import type { ColorScheme } from './context/ColorSchemeContext'
import type { ImageUploadFn } from './plugins/ImageUploadPlugin'
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
  header?: ReactNode
  onEditorReady?: (editor: LexicalEditor | null) => void
  extraNodes?: Array<Klass<LexicalNode>>
  rendererConfig?: RendererConfig
  imageUpload?: ImageUploadFn
  debounceMs?: number
  children?: ReactNode
}
