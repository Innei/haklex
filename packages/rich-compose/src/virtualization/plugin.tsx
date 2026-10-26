import type { RecyclerOptions } from '@haklex/rich-editor/recycler';
import { lazy, Suspense } from 'react';

import type { RichRendererModule } from '../core/types';
import type { RendererSurfaceProps } from '../static-renderer/surface';

export type RendererVirtualizationOptions = RecyclerOptions;
export type RendererVirtualization = boolean | RendererVirtualizationOptions;

const VirtualizedRenderer = lazy(() =>
  import('./VirtualizedRenderer').then((module) => ({ default: module.VirtualizedRenderer })),
);

export function InitialRows({ document }: RendererSurfaceProps) {
  return <>{document.rows.slice(0, 12).map((_, index) => document.render(index))}</>;
}

export function createVirtualizationSurface(options: RendererVirtualizationOptions = {}) {
  return function VirtualizationSurface(props: RendererSurfaceProps) {
    return (
      <Suspense fallback={<InitialRows {...props} />}>
        <VirtualizedRenderer {...props} options={options} />
      </Suspense>
    );
  };
}

/** Installs the complete rendering surface through the ordinary compose module contract. */
export function rendererVirtualizationModule(
  options: RendererVirtualizationOptions = {},
): RichRendererModule {
  return { name: 'virtualization', surface: createVirtualizationSurface(options) };
}
