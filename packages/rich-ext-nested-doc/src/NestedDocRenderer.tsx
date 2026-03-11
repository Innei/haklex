import {
  type RichEditorVariant,
  useColorScheme,
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
  const theme = useColorScheme();
  const rendererConfig = useRendererConfig();

  return (
    <RichRenderer rendererConfig={rendererConfig} theme={theme} value={value} variant={variant} />
  );
}
