import type { ExcalidrawProps } from '@excalidraw/excalidraw/types';
import { useColorScheme } from '@haklex/rich-editor/static';
import { confirmDiscardChanges, presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { Pencil } from 'lucide-react';
import type { ComponentType, FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useExcalidrawConfig } from './ExcalidrawConfigContext';
import { ExcalidrawEditorDialog } from './ExcalidrawEditorDialog';
import {
  ExcalidrawEmptyState,
  ExcalidrawErrorState,
  ExcalidrawLoadingState,
} from './ExcalidrawFrameStates';
import { countElements, toScene } from './scene/normalize';
import { Scene } from './scene/Scene';
import * as css from './styles.css';
import type { ExcalidrawSnapshot } from './types';
import { useExcalidrawData } from './useExcalidrawData';
import { useExcalidrawFont } from './useExcalidrawFont';

export interface ExcalidrawEditRendererProps {
  onSnapshotChange: (snapshot: ExcalidrawSnapshot) => void;
  snapshot: ExcalidrawSnapshot | null;
}

export const ExcalidrawEditRenderer: FC<ExcalidrawEditRendererProps> = ({
  snapshot,
  onSnapshotChange,
}) => {
  const theme = useColorScheme();
  const { saveSnapshot } = useExcalidrawConfig();
  const {
    snapshot: initialData,
    loading: dataLoading,
    error: dataError,
    retry,
    retryable,
    baseRef,
    baseData,
  } = useExcalidrawData(snapshot);
  const [editedData, setEditedData] = useState<Record<string, any> | undefined>();
  const [editorLoading, setEditorLoading] = useState(false);
  const excalidrawRef = useRef<ComponentType<ExcalidrawProps> | null>(null);
  const onSnapshotChangeRef = useRef(onSnapshotChange);
  onSnapshotChangeRef.current = onSnapshotChange;
  const saveSnapshotRef = useRef(saveSnapshot);
  saveSnapshotRef.current = saveSnapshot;
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const { className: portalClassName } = usePortalTheme();
  useExcalidrawFont();

  const previewData = editedData ?? initialData;
  const previewDataRef = useRef(previewData);
  previewDataRef.current = previewData;
  const previewScene = useMemo(() => toScene(previewData), [previewData]);

  const baseRefRef = useRef(baseRef);
  const baseDataRefOuter = useRef(baseData);
  useEffect(() => {
    if (baseRef) baseRefRef.current = baseRef;
  }, [baseRef]);
  useEffect(() => {
    if (baseData) baseDataRefOuter.current = baseData;
  }, [baseData]);

  const loadExcalidraw = useCallback(async () => {
    if (excalidrawRef.current) return excalidrawRef.current;
    const [mod] = await Promise.all([
      import('@excalidraw/excalidraw'),
      import('@excalidraw/excalidraw/index.css'),
    ]);
    const Comp = (mod as any).Excalidraw || (mod as any).default?.Excalidraw;
    excalidrawRef.current = Comp ?? null;
    return excalidrawRef.current;
  }, []);

  const handleOpenEditor = useCallback(async () => {
    if (dataLoading || editorLoading) return;
    setEditorLoading(true);
    let ExcalidrawComponent: ComponentType<ExcalidrawProps> | null = null;
    try {
      ExcalidrawComponent = await loadExcalidraw();
    } catch (err) {
      console.error('[excalidraw] failed to load', err);
    } finally {
      setEditorLoading(false);
    }
    if (!ExcalidrawComponent) return;
    const session = { dirty: false, confirming: false, escapeHeld: false };
    // The dialog's own Escape listener still fires for an Escape Excalidraw consumes; veto it for that dispatch.
    const holdEscapeDismiss = () => {
      session.escapeHeld = true;
      setTimeout(() => {
        session.escapeHeld = false;
      }, 0);
    };
    presentDialog({
      content: ({ dismiss, requestDismiss }) => (
        <ExcalidrawEditorDialog
          ExcalidrawComponent={ExcalidrawComponent}
          baseData={baseDataRefOuter.current}
          baseRef={baseRefRef.current}
          dismiss={dismiss}
          holdEscapeDismiss={holdEscapeDismiss}
          initialData={previewDataRef.current}
          initialSnapshot={snapshotRef.current}
          isConfirming={() => session.confirming}
          requestDismiss={requestDismiss}
          saveSnapshot={saveSnapshotRef.current}
          theme={theme}
          onSave={(ref) => onSnapshotChangeRef.current(ref)}
          onClose={(doc) => {
            if (doc) setEditedData(doc);
          }}
          onDirtyChange={(dirty) => {
            session.dirty = dirty;
          }}
        />
      ),
      className: css.excalidrawFullscreenPopup,
      portalClassName,
      theme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
      confirmDismiss: async () => {
        if (session.escapeHeld) return false;
        if (!session.dirty) return true;
        if (session.confirming) return false;
        session.confirming = true;
        try {
          return await confirmDiscardChanges();
        } finally {
          session.confirming = false;
        }
      },
    });
  }, [dataLoading, editorLoading, loadExcalidraw, theme, portalClassName]);

  if (dataLoading) {
    return (
      <div className={css.excalidrawEditorContainer}>
        <ExcalidrawLoadingState />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className={css.excalidrawEditorContainer}>
        <ExcalidrawErrorState message={dataError} onRetry={retryable ? retry : undefined} />
      </div>
    );
  }

  return (
    <div className={css.excalidrawEditorContainer}>
      {previewScene && countElements(previewScene) > 0 ? (
        <Scene scene={previewScene} theme={theme} />
      ) : (
        <ExcalidrawEmptyState />
      )}

      <button
        aria-label="Edit whiteboard"
        className={css.excalidrawEditOverlay}
        type="button"
        onClick={handleOpenEditor}
      >
        <span className={css.excalidrawEditLabel}>
          <Pencil size={14} />
          {editorLoading ? 'Loading editor…' : 'Edit'}
        </span>
      </button>
    </div>
  );
};
