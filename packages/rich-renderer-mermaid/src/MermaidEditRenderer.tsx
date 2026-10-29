import type { MermaidRendererProps } from '@haklex/rich-editor/renderers';
import { useColorScheme } from '@haklex/rich-editor/static';
import { confirmDiscardChanges, presentDialog, usePortalTheme } from '@haklex/rich-editor-ui';
import type { FC } from 'react';
import { useCallback } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { MermaidEditorModal } from './MermaidEditorModal';
import * as css from './styles.css';
import { useMermaidRender } from './useMermaidRender';
import { ZoomControls } from './ZoomControls';

export const MermaidEditRenderer: FC<MermaidRendererProps> = ({ content, onContentChange }) => {
  const colorScheme = useColorScheme();
  const { error, imgSrc, width, height } = useMermaidRender(content);
  const { className: portalClassName } = usePortalTheme();

  const handleClick = useCallback(() => {
    if (!onContentChange) return;
    let dirty = false;
    const setDirty = (next: boolean) => {
      dirty = next;
    };
    presentDialog({
      content: ({ dismiss, requestDismiss }) => (
        <MermaidEditorModal
          colorScheme={colorScheme}
          dismiss={dismiss}
          initialContent={content}
          requestDismiss={requestDismiss}
          onDirtyChange={setDirty}
          onSave={onContentChange}
        />
      ),
      className: css.editorPopup,
      portalClassName,
      theme: colorScheme,
      width: 1024,
      sheet: 'auto',
      showCloseButton: false,
      confirmDismiss: () => !dirty || confirmDiscardChanges(),
    });
  }, [onContentChange, content, portalClassName, colorScheme]);

  if (!imgSrc) {
    return <div className={css.mermaidError}>{error || 'Render failed'}</div>;
  }

  return (
    <div className={css.mermaidContainer}>
      {onContentChange && (
        <button
          aria-label="Edit diagram"
          className={css.mermaidEditHint}
          type="button"
          onClick={handleClick}
        >
          Edit
        </button>
      )}
      <TransformWrapper
        initialScale={1}
        maxScale={4}
        minScale={0.5}
        wheel={{
          disabled: true,
        }}
      >
        <ZoomControls />
        <TransformComponent
          wrapperStyle={{ width: '100%' }}
          contentStyle={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img alt="Mermaid diagram" height={height} src={imgSrc} width={width} />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};
