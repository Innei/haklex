import {
  useColorScheme,
  useOptionalNestedContentRenderer,
  useVariant,
} from '@haklex/rich-editor/static'
import { RichRenderer } from '@haklex/rich-static-renderer'
import type { SerializedEditorState } from 'lexical'

export function NestedDocRenderer({ value }: { value: SerializedEditorState }) {
  const renderNestedContent = useOptionalNestedContentRenderer()
  const variant = useVariant()
  const theme = useColorScheme()

  if (renderNestedContent) {
    return <>{renderNestedContent(value)}</>
  }

  return <RichRenderer value={value} variant={variant} theme={theme} />
}
