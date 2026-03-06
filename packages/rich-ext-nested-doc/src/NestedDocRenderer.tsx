import {
  useColorScheme,
  useRendererConfig,
  useVariant,
} from '@haklex/rich-editor/static'
import { RichRenderer } from '@haklex/rich-static-renderer'
import type { SerializedEditorState } from 'lexical'

export function NestedDocRenderer({ value }: { value: SerializedEditorState }) {
  const variant = useVariant()
  const theme = useColorScheme()
  const rendererConfig = useRendererConfig()

  return (
    <RichRenderer
      value={value}
      variant={variant}
      theme={theme}
      rendererConfig={rendererConfig}
    />
  )
}
