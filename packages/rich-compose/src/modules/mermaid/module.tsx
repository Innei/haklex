import type { RichRendererModule } from '../../core/types';
import { MermaidSsrFallback } from './ssr-fallback';

export const mermaidModule: RichRendererModule = {
  name: 'mermaid',
  lazyRenderers: {
    Mermaid: () => import('./renderer'),
  },
  ssrFallback: {
    Mermaid: <MermaidSsrFallback />,
  },
};
