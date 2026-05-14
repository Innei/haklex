import { $toMarkdown, allHeadlessNodes } from '@haklex/rich-headless';
import { createHeadlessEditor } from '@lexical/headless';
import type { SerializedEditorState } from 'lexical';

export function renderMarkdown(state: SerializedEditorState): string {
  const editor = createHeadlessEditor({ nodes: allHeadlessNodes });
  const parsed = editor.parseEditorState(JSON.stringify(state));
  let md = '';
  parsed.read(() => {
    md = $toMarkdown();
  });
  return md;
}
