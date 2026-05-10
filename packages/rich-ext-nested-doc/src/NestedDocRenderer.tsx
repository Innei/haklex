import {
  type RichEditorVariant,
  useOptionalNestedContentRenderer,
} from '@haklex/rich-editor/static';
import type { SerializedEditorState } from 'lexical';

export function NestedDocRenderer({
  value,
  variant = 'comment',
}: {
  value: SerializedEditorState;
  variant?: RichEditorVariant;
}) {
  const renderNestedContent = useOptionalNestedContentRenderer();

  if (!renderNestedContent) {
    return null;
  }

  return <>{renderNestedContent(value, variant)}</>;
}
