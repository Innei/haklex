import { ViewportGate } from '@haklex/rich-editor-ui';
import type { FC } from 'react';
import { lazy, Suspense } from 'react';

import * as css from './styles.css';
import type { OnWhiteboardExpand } from './WhiteboardDisplayRenderer';
import { WhiteboardPlaceholderState } from './WhiteboardFrameStates';

export interface WhiteboardSSRRendererProps {
  onExpand?: OnWhiteboardExpand;
  snapshot: string;
}

const LazyDisplayRenderer = lazy(() =>
  import('./WhiteboardDisplayRenderer').then((m) => ({
    default: m.WhiteboardDisplayRenderer,
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

const WhiteboardPlaceholder: FC<{ snapshot: string }> = ({ snapshot }) => (
  <div className={css.whiteboardPlaceholder}>
    <WhiteboardPlaceholderState elementCount={countInlineElements(snapshot)} />
  </div>
);

export const WhiteboardSSRRenderer: FC<WhiteboardSSRRendererProps> = ({ onExpand, snapshot }) => {
  return (
    <ViewportGate fallback={<WhiteboardPlaceholder snapshot={snapshot} />}>
      <Suspense fallback={<WhiteboardPlaceholder snapshot={snapshot} />}>
        <LazyDisplayRenderer snapshot={snapshot} onExpand={onExpand} />
      </Suspense>
    </ViewportGate>
  );
};
