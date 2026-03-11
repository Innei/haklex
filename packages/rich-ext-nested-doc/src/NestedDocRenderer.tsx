import {
  type RichEditorVariant,
  useColorScheme,
  useOptionalNestedContentRenderer,
  useRendererConfig,
} from '@haklex/rich-editor/static';
import { RichRenderer } from '@haklex/rich-static-renderer';
import type { SerializedEditorState } from 'lexical';

export function NestedDocRenderer({
  value,
  variant = 'comment',
}: {
  value: SerializedEditorState;
  variant?: RichEditorVariant;
}) {
  const renderNestedContent = useOptionalNestedContentRenderer();
  const theme = useColorScheme();
  const rendererConfig = useRendererConfig();

  if (renderNestedContent) {
    return <>{renderNestedContent(value, variant)}</>;
  }

  return (
    <RichRenderer rendererConfig={rendererConfig} theme={theme} value={value} variant={variant} />
  );
}
