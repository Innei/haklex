import type {
  ColorScheme,
  RendererConfig,
  RichEditorVariant,
} from '@haklex/rich-editor/static'
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical'
import type { CSSProperties } from 'react'

export interface RichRendererProps {
  value: SerializedEditorState
  variant?: RichEditorVariant
  theme?: ColorScheme
  className?: string
  style?: CSSProperties
  as?: keyof React.JSX.IntrinsicElements
  rendererConfig?: RendererConfig
  extraNodes?: Array<Klass<LexicalNode>>
}
