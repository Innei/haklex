import { ViewportGate } from '@haklex/rich-editor-ui';
import type { FC } from 'react';
import { lazy, Suspense } from 'react';

import type { OnExcalidrawExpand } from './ExcalidrawDisplayRenderer';
import { ExcalidrawPlaceholderState } from './ExcalidrawFrameStates';
import * as css from './styles.css';

export interface ExcalidrawSSRRendererProps {
  onExpand?: OnExcalidrawExpand;
  snapshot: string;
}

const LazyDisplayRenderer = lazy(() =>
  import('./ExcalidrawDisplayRenderer').then((m) => ({
    default: m.ExcalidrawDisplayRenderer,
  })),
);

function countInlineElements(snapshot: string): number | undefined {
  try {
    const data = JSON.parse(snapshot);
    if (data && typeof data === 'object' && Array.isArray(data.elements)) {
      return data.elements.filter((el: { isDeleted?: boolean }) => !el?.isDeleted).length;
    }
  } catch {
    // snapshot may be a URL ref, delta format (URL\ndelta-json), or invalid JSON
  }
  return undefined;
}

const ExcalidrawPlaceholder: FC<{ snapshot: string }> = ({ snapshot }) => (
  <div className={css.excalidrawPlaceholder}>
    <ExcalidrawPlaceholderState elementCount={countInlineElements(snapshot)} />
  </div>
);

export const ExcalidrawSSRRenderer: FC<ExcalidrawSSRRendererProps> = ({ onExpand, snapshot }) => {
  return (
    <ViewportGate fallback={<ExcalidrawPlaceholder snapshot={snapshot} />}>
      <Suspense fallback={<ExcalidrawPlaceholder snapshot={snapshot} />}>
        <LazyDisplayRenderer snapshot={snapshot} onExpand={onExpand} />
      </Suspense>
    </ViewportGate>
  );
};
