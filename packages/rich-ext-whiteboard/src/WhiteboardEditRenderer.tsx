import { useColorScheme } from '@haklex/rich-editor/static';
import { confirmDiscardChanges, presentDialog } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { Pencil } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { countElements, toScene } from './scene/normalize';
import { Scene } from './scene/Scene';
import * as css from './styles.css';
import type { WhiteboardSnapshot } from './types';
import { useWhiteboardData } from './useWhiteboardData';
import { useWhiteboardFont } from './useWhiteboardFont';
import { useWhiteboardConfig } from './WhiteboardConfigContext';
import { WhiteboardEditorDialog } from './WhiteboardEditorDialog';
import {
  WhiteboardEmptyState,
  WhiteboardErrorState,
  WhiteboardLoadingState,
} from './WhiteboardFrameStates';

export interface WhiteboardEditRendererProps {
  onSnapshotChange: (snapshot: WhiteboardSnapshot) => void;
  snapshot: WhiteboardSnapshot | null;
}

export const WhiteboardEditRenderer: FC<WhiteboardEditRendererProps> = ({
  snapshot,
  onSnapshotChange,
}) => {
  const theme = useColorScheme();
  const { saveSnapshot, uploadFile } = useWhiteboardConfig();
  const {
    snapshot: initialData,
    loading: dataLoading,
    error: dataError,
    retry,
    retryable,
    baseRef,
    baseData,
  } = useWhiteboardData(snapshot);
  const [editedData, setEditedData] = useState<Record<string, any> | undefined>();
  const onSnapshotChangeRef = useRef(onSnapshotChange);
  onSnapshotChangeRef.current = onSnapshotChange;
  const saveSnapshotRef = useRef(saveSnapshot);
  saveSnapshotRef.current = saveSnapshot;
  const uploadFileRef = useRef(uploadFile);
  uploadFileRef.current = uploadFile;
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const { className: portalClassName } = usePortalTheme();
  useWhiteboardFont();

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

  const handleOpenEditor = useCallback(() => {
    if (dataLoading) return;
    const session = { dirty: false, confirming: false, escapeHeld: false };
    // The dialog stack's own Escape listener still fires for an Escape the canvas consumes; veto it for that dispatch.
    const holdEscapeDismiss = () => {
      session.escapeHeld = true;
      setTimeout(() => {
        session.escapeHeld = false;
      }, 0);
    };
    presentDialog({
      content: ({ dismiss, requestDismiss }) => (
        <WhiteboardEditorDialog
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
          uploadFile={uploadFileRef.current}
          onSave={(ref) => onSnapshotChangeRef.current(ref)}
          onClose={(doc) => {
            if (doc) setEditedData(doc);
          }}
          onDirtyChange={(dirty) => {
            session.dirty = dirty;
          }}
        />
      ),
      className: css.whiteboardFullscreenPopup,
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
  }, [dataLoading, theme, portalClassName]);

  if (dataLoading) {
    return (
      <div className={css.whiteboardEditorContainer}>
        <WhiteboardLoadingState />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className={css.whiteboardEditorContainer}>
        <WhiteboardErrorState message={dataError} onRetry={retryable ? retry : undefined} />
      </div>
    );
  }

  return (
    <div className={css.whiteboardEditorContainer}>
      {previewScene && countElements(previewScene) > 0 ? (
        <Scene scene={previewScene} theme={theme} />
      ) : (
        <WhiteboardEmptyState />
      )}

      <button
        aria-label="Edit whiteboard"
        className={css.whiteboardEditOverlay}
        type="button"
        onClick={handleOpenEditor}
      >
        <span className={css.whiteboardEditLabel}>
          <Pencil size={14} />
          Edit
        </span>
      </button>
    </div>
  );
};
