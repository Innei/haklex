import { codeSnippetNodes } from '@haklex/rich-ext-code-snippet/node';

import type { RichRendererModule } from '../../core/types';

export const codeSnippetModule: RichRendererModule = {
  name: 'code-snippet',
  nodes: codeSnippetNodes,
  lazyRenderers: {
    CodeSnippet: () => import('@haklex/rich-ext-code-snippet/renderer'),
  },
};
