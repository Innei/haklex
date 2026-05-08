import { codeSnippetNodes, CodeSnippetRenderer } from '@haklex/rich-ext-code-snippet/static';

import type { RichRendererModule } from '../../core/types';

export const codeSnippetModule: RichRendererModule = {
  name: 'code-snippet',
  nodes: codeSnippetNodes,
  renderers: { CodeSnippet: CodeSnippetRenderer },
};
