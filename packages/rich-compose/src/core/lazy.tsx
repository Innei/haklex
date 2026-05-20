import type { RendererConfig } from '@haklex/rich-editor/static';
import type { ComponentType, ReactNode } from 'react';
import { lazy, Suspense } from 'react';

import type { RendererKey, RichRendererModule } from './types';

/**
 * Build sync wrappers around `React.lazy(loader)` factories.
 *
 * Each factory is created exactly **once** at compose time, not per render.
 * Recreating the factory on every render would force React to refetch the
 * chunk and replay the Suspense fallback, causing flicker.
 */
export function wrapLazy(modules: RichRendererModule[]): Partial<RendererConfig> {
  const result: Partial<RendererConfig> = {};

  for (const m of modules) {
    if (!m.lazyRenderers) continue;
    for (const key of Object.keys(m.lazyRenderers) as RendererKey[]) {
      const loader = m.lazyRenderers[key];
      if (!loader) continue;
      const fallback: ReactNode = m.ssrFallback?.[key] ?? null;
      const LazyInner = lazy(loader as () => Promise<{ default: ComponentType<any> }>);
      const Wrapped: ComponentType<any> = (props: any) => (
        <Suspense fallback={fallback}>
          <LazyInner {...props} />
        </Suspense>
      );
      Wrapped.displayName = `Lazy(${m.name}.${String(key)})`;
      // RendererConfig values are weakly typed by key — assign without narrowing.
      (result as Record<string, ComponentType<any>>)[key] = Wrapped;
    }
  }

  return result;
}
