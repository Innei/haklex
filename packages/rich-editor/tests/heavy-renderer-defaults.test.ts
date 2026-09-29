import type { EditorConfig, LexicalEditor } from 'lexical';
import { createEditor } from 'lexical';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { RendererWrapper } from '../src/components/RendererWrapper';
import { $createCodeBlockNode, CodeBlockNode } from '../src/nodes/CodeBlockNode';
import { $createKaTeXBlockNode, KaTeXBlockNode } from '../src/nodes/KaTeXBlockNode';
import { $createKaTeXInlineNode, KaTeXInlineNode } from '../src/nodes/KaTeXInlineNode';

// Static nodes must not reference renderers that pull shiki or katex: Metro
// cannot split dynamic imports, so any reachable default ends up in native
// bundles that render these blocks themselves.
describe('heavy renderer defaults', () => {
  const editor = createEditor({
    namespace: 'HeavyRendererDefaults',
    nodes: [CodeBlockNode, KaTeXBlockNode, KaTeXInlineNode],
    onError: (error) => {
      throw error;
    },
  });

  const decorations: ReactElement[] = [];
  editor.update(
    () => {
      for (const node of [
        $createCodeBlockNode('const a = 1', 'ts'),
        $createKaTeXBlockNode('x^2'),
        $createKaTeXInlineNode('y'),
      ]) {
        decorations.push(node.decorate(editor as LexicalEditor, {} as EditorConfig));
      }
    },
    { discrete: true },
  );

  it.each([
    ['code-block', 0],
    ['katex block', 1],
    ['katex inline', 2],
  ])('%s resolves its renderer from RendererConfig only', (_, index) => {
    const element = decorations[index] as ReactElement<{ defaultRenderer?: unknown }>;
    expect(element.type).toBe(RendererWrapper);
    expect(element.props.defaultRenderer).toBeUndefined();
  });
});
