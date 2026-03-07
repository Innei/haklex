import type {
  ColorScheme,
  RendererConfig,
  RichEditorVariant,
} from '@haklex/rich-editor/static'
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical'
import type { CSSProperties, ReactNode } from 'react'

export type BuiltinNodeRenderer = (
  node: any,
  key: string,
  children: ReactNode[] | null,
  defaultRenderer: () => ReactNode,
) => ReactNode

export interface RichRendererProps {
  value: SerializedEditorState
  variant?: RichEditorVariant
  theme?: ColorScheme
  className?: string
  style?: CSSProperties
  as?: keyof React.JSX.IntrinsicElements
  rendererConfig?: RendererConfig
  extraNodes?: Array<Klass<LexicalNode>>
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>
}
