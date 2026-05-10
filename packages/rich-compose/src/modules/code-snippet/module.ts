import { codeSnippetNodes } from '@haklex/rich-ext-code-snippet/node';

import type { RichRendererModule } from '../../core/types';

/**
 * Code-snippet module — registers CodeSnippetNode (light) and lazy-loads
 * CodeSnippetRenderer (shiki). Consumers can supply a thin override module
 * to keep the heavy shiki-based default out of the bundle.
 */
export const codeSnippetModule: RichRendererModule = {
  name: 'code-snippet',
  nodes: codeSnippetNodes,
  lazyRenderers: {
    CodeSnippet: () => import('@haklex/rich-ext-code-snippet/renderer'),
  },
};
