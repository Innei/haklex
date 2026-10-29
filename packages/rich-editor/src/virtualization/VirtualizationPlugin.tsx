import { lazy, Suspense, useMemo } from 'react';

import { EditorSurfacePlugin, type EditorSurfaceProps } from '../context/EditorSurfaceContext';
import type { EditorVirtualizationOptions } from './types';

const VirtualizedEditor = lazy(() =>
  import('./VirtualizedEditor').then((module) => ({ default: module.VirtualizedEditor })),
);

export function VirtualizationPlugin({
  scrollContainer,
  overscan,
  estimateBlockHeight,
  preserveCapacity,
  selectionMergeLimit,
  priority = 0,
}: EditorVirtualizationOptions & { priority?: number }) {
  const surface = useMemo(() => {
    const options = {
      scrollContainer,
      overscan,
      estimateBlockHeight,
      preserveCapacity,
      selectionMergeLimit,
    };
    return function VirtualizationSurface(props: EditorSurfaceProps) {
      return (
        <Suspense fallback={<p role="status">Loading editor…</p>}>
          <VirtualizedEditor {...props} options={options} />
        </Suspense>
      );
    };
  }, [scrollContainer, overscan, estimateBlockHeight, preserveCapacity, selectionMergeLimit]);
  return <EditorSurfacePlugin priority={priority} surface={surface} />;
}
