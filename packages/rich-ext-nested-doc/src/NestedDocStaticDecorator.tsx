import { useColorScheme, usePresentDialog, useVariant } from '@haklex/rich-editor/static';
import { usePortalTheme } from '@haklex/rich-style-token';
import type { SerializedEditorState } from 'lexical';
import { Maximize2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { NestedDocRenderer } from './NestedDocRenderer';
import * as css from './styles.css';
import { hasRenderableEditorState, truncateEditorState } from './utils';

const PREVIEW_NODE_LIMIT = 6;

interface NestedDocStaticDecoratorProps {
  contentState: SerializedEditorState;
}

export function NestedDocStaticDecorator({ contentState }: NestedDocStaticDecoratorProps) {
  const colorScheme = useColorScheme();
  const { className: portalClassName } = usePortalTheme();
  const presentDialogFromCtx = usePresentDialog();

  const children = contentState.root?.children ?? [];
  const needsTruncation = children.length > PREVIEW_NODE_LIMIT;
  const previewState = useMemo(
    () => truncateEditorState(contentState, PREVIEW_NODE_LIMIT),
    [contentState],
  );
  const hasPreview = hasRenderableEditorState(contentState);

  const title = useMemo(() => {
    const firstChild = children[0] as any;
    if (!firstChild) return '';
    const walk = (node: any): string => {
      if (node.text) return node.text;
      if (node.children) return node.children.map(walk).join('');
      return '';
    };
    return walk(firstChild).slice(0, 80);
  }, [children]);

  const contextVariant = useVariant();
  const handleOpen = useCallback(async () => {
    const present = presentDialogFromCtx ?? (await import('@haklex/rich-editor-ui')).presentDialog;

    present({
      title: title || undefined,
      content: () => (
        <div className={css.staticDialogBody}>
          <NestedDocRenderer value={contentState} variant={contextVariant} />
        </div>
      ),
      className: css.staticDialogPopup,
      portalClassName,
      theme: colorScheme,
      showCloseButton: true,
      clickOutsideToDismiss: true,
      sheet: 'auto',
    });
  }, [colorScheme, contentState, portalClassName, presentDialogFromCtx, title, contextVariant]);

  if (!hasPreview) {
    return null;
  }

  return (
    <div
      className={css.staticOverlayRoot}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
    >
      <div className={`${css.rendererContent} rich-nested-doc-content`}>
        <div className={css.previewSurface}>
          <NestedDocRenderer value={previewState} />
        </div>
      </div>
      {needsTruncation && <div aria-hidden className={css.staticGradientMask} />}
      <div aria-hidden className={css.staticOverlay}>
        <Maximize2 size={24} />
      </div>
    </div>
  );
}
