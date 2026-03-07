import { useRendererMode } from '@haklex/rich-editor';
import type { RubyRendererProps } from '@haklex/rich-editor/renderers';

import { RubyRenderer } from './RubyRenderer';

export function RubyEditRenderer(props: RubyRendererProps) {
  const mode = useRendererMode();

  if (mode !== 'editor') {
    return <RubyRenderer {...props} />;
  }

  return <RubyRenderer {...props} />;
}
