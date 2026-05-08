import type { RichRendererModule } from '../../core/types';
import { MermaidSsrFallback } from './ssr-fallback';

/**
 * Mermaid module — `MermaidNode` is registered by `@haklex/rich-editor`
 * (in `customNodes`/`allNodes`). The default renderer
 * (`@haklex/rich-renderer-mermaid`) pulls mermaid lib (~2MB), so it ships
 * as a separate lazy chunk with a deterministic SSR fallback.
 */
export const mermaidModule: RichRendererModule = {
  name: 'mermaid',
  lazyRenderers: {
    Mermaid: () => import('./renderer'),
  },
  ssrFallback: {
    Mermaid: <MermaidSsrFallback />,
  },
};
