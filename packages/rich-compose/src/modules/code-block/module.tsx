import type { RichRendererModule } from '../../core/types';
import { CodeBlockSsrFallback } from './ssr-fallback';

export const codeBlockModule: RichRendererModule = {
  name: 'code-block',
  lazyRenderers: {
    CodeBlock: () => import('./renderer'),
  },
  ssrFallback: {
    CodeBlock: <CodeBlockSsrFallback />,
  },
};
