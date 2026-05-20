import { RendererWrapper } from '@haklex/rich-editor/static';
import type { SerializedEditorState } from 'lexical';
import { Maximize2 } from 'lucide-react';
import { useMemo } from 'react';

import { NestedDocRenderer } from './NestedDocRenderer';
import { NESTED_DOC_NODE_KEY } from './slot';
import * as css from './styles.css';
import { hasRenderableEditorState, truncateEditorState } from './utils';

const PREVIEW_NODE_LIMIT = 6;

export interface NestedDocPreviewCardProps {
  contentState: SerializedEditorState;
  onActivate?: (target: HTMLElement) => void;
}

export function NestedDocPreviewCard({ contentState, onActivate }: NestedDocPreviewCardProps) {
  const children = contentState.root?.children ?? [];
  const needsTruncation = children.length > PREVIEW_NODE_LIMIT;
  const previewState = useMemo(
    () => truncateEditorState(contentState, PREVIEW_NODE_LIMIT),
    [contentState],
  );
  const hasPreview = hasRenderableEditorState(contentState);

  if (!hasPreview) return null;

  const interactive = Boolean(onActivate);

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={
        interactive
          ? `${css.staticOverlayRoot} ${css.staticOverlayRootInteractive}`
          : css.staticOverlayRoot
      }
      onClick={interactive ? (e) => onActivate?.(e.currentTarget as HTMLElement) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivate?.(e.currentTarget as HTMLElement);
              }
            }
          : undefined
      }
    >
      <div className={`${css.rendererContent} rich-nested-doc-content`}>
        <div className={css.previewSurface}>
          <NestedDocRenderer value={previewState} />
        </div>
      </div>
      {needsTruncation && <div aria-hidden className={css.staticGradientMask} />}
      {interactive && (
        <div aria-hidden className={css.staticOverlay}>
          <Maximize2 size={24} />
        </div>
      )}
    </div>
  );
}

interface NestedDocStaticDecoratorProps {
  contentState: SerializedEditorState;
}

function DefaultNestedDocStaticRenderer({ contentState }: NestedDocStaticDecoratorProps) {
  return <NestedDocPreviewCard contentState={contentState} />;
}

export function NestedDocStaticDecorator({ contentState }: NestedDocStaticDecoratorProps) {
  return (
    <RendererWrapper
      defaultRenderer={DefaultNestedDocStaticRenderer}
      props={{ contentState }}
      rendererKey={NESTED_DOC_NODE_KEY}
    />
  );
}
