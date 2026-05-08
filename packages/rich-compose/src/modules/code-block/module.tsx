import type { RichRendererModule } from '../../core/types';
import { CodeBlockSsrFallback } from './ssr-fallback';

/**
 * Code-block module — uses Lexical's builtin `code` node, so no `nodes`
 * field. The default renderer (`@haklex/rich-renderer-codeblock`) is heavy
 * (shiki) and ships in a separate lazy chunk.
 *
 * The SSR fallback emits a `<pre>` shell so server-rendered HTML keeps
 * layout stable before the lazy chunk resolves. The lazy renderer replaces
 * it with shiki-tokenized output after hydration.
 */
export const codeBlockModule: RichRendererModule = {
  name: 'code-block',
  lazyRenderers: {
    CodeBlock: () => import('./renderer'),
  },
  ssrFallback: {
    CodeBlock: <CodeBlockSsrFallback />,
  },
};
