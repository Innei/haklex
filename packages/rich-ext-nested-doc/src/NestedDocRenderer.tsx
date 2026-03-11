import { useColorScheme, useRendererConfig } from '@haklex/rich-editor/static';
import { RichRenderer } from '@haklex/rich-static-renderer';
import type { SerializedEditorState } from 'lexical';

export function NestedDocRenderer({ value }: { value: SerializedEditorState }) {
  const theme = useColorScheme();
  const rendererConfig = useRendererConfig();

  return (
    <RichRenderer rendererConfig={rendererConfig} theme={theme} value={value} variant={'comment'} />
  );
}
