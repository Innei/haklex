import type { ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw/excalidraw/types/types';
import { useColorScheme } from '@haklex/rich-editor';
import { dismissTopDialog, presentDialog, SegmentedControl } from '@haklex/rich-editor-ui';
import { usePortalTheme } from '@haklex/rich-style-token';
import { Clipboard, Download, Pencil, Save, X } from 'lucide-react';
import type { ComponentType, FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { readonlyUIOptions } from './constants';
import { useExcalidrawConfig } from './ExcalidrawConfigContext';
import * as css from './styles.css';
import type { ExcalidrawSnapshot } from './types';
import { useExcalidrawData } from './useExcalidrawData';

export interface ExcalidrawEditRendererProps {
  onSnapshotChange: (snapshot: ExcalidrawSnapshot) => void;
  snapshot: ExcalidrawSnapshot | null;
}

const SAVE_DEBOUNCE_MS = 2000;

// ── Dialog content (fullscreen editor) ──────────────────────────

const ExcalidrawEditorDialogContent: FC<{
  dismiss: () => void;
  ExcalidrawComponent: ComponentType<ExcalidrawProps>;
  initialData: Record<string, any> | undefined;
  initialSnapshot: ExcalidrawSnapshot | null;
  theme: 'light' | 'dark';
  onSave: (snapshot: ExcalidrawSnapshot) => void;
  saveSnapshot?: (snapshot: object, existingRef?: string) => Promise<string>;
  onClose: (doc?: Record<string, any>) => void;
  baseRef?: string;
  baseData?: Record<string, any>;
}> = ({
  dismiss,
  ExcalidrawComponent,
  initialData,
  initialSnapshot,
  theme,
  onSave,
  saveSnapshot,
  onClose,
  baseRef,
  baseData,
}) => {
  const { className: portalClassName } = usePortalTheme();
  const apiRef = useRef<any>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  const confirmDialogOpenRef = useRef(false);
  const initializedRef = useRef(false);
  const baseRefRef = useRef(baseRef);
  const baseDataRef = useRef(baseData);
  const [storageMode, setStorageMode] = useState<'inline' | 'remote' | 'delta'>(() => {
    if (!saveSnapshot || !initialSnapshot) return 'inline';
    return initialSnapshot.type === 'delta'
      ? 'delta'
      : initialSnapshot.type === 'remote'
        ? 'remote'
        : 'inline';
  });
  const storageModeRef = useRef(storageMode);
  const [savedRef, setSavedRef] = useState(() => {
    if (!saveSnapshot || !initialSnapshot) return '';
    if (initialSnapshot.type === 'remote') return initialSnapshot.url;
    if (initialSnapshot.type === 'delta') return initialSnapshot.baseUrl;
    return '';
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    const appState = api.getAppState();
    return {
      elements: api.getSceneElements(),
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        gridSize: appState.gridSize,
      },
      files: api.getFiles(),
    };
  }, []);

  // Upload to server and update internal refs. Does NOT emit to Lexical node.
  // Lexical node is only updated when the dialog closes via emitSnapshot().
  const performSave = useCallback((): Promise<void> => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const doc = getSnapshot();
    if (!doc) return Promise.resolve();
    const mode = storageModeRef.current;

    if (mode === 'delta' && saveSnapshot) {
      setIsSaving(true);
      return (async () => {
        try {
          const currentBaseUrl = baseRefRef.current;
          const currentBaseData = baseDataRef.current;

          if (!currentBaseUrl || !currentBaseData) {
            const ref = await saveSnapshot(doc, baseRefRef.current || undefined);
            baseRefRef.current = ref;
            baseDataRef.current = doc as Record<string, any>;
            setSavedRef(ref);
          }
          isDirtyRef.current = false;
          setIsDirty(false);
        } finally {
          setIsSaving(false);
        }
      })();
    }

    if (mode === 'remote' && saveSnapshot) {
      // Skip upload if content unchanged since last save
      if (
        baseRefRef.current &&
        baseDataRef.current &&
        JSON.stringify(doc) === JSON.stringify(baseDataRef.current)
      ) {
        isDirtyRef.current = false;
        setIsDirty(false);
        return Promise.resolve();
      }
      setIsSaving(true);
      return saveSnapshot(doc, baseRefRef.current || undefined).then(
        (ref) => {
          baseRefRef.current = ref;
          baseDataRef.current = doc as Record<string, any>;
          isDirtyRef.current = false;
          setIsDirty(false);
          setIsSaving(false);
          setSavedRef(ref);
        },
        () => {
          setIsSaving(false);
        },
      );
    }

    // inline — no upload needed, just mark clean
    isDirtyRef.current = false;
    setIsDirty(false);
    return Promise.resolve();
  }, [saveSnapshot, getSnapshot]);

  // Compose the final ExcalidrawSnapshot from current state and emit to Lexical node.
  const emitSnapshot = useCallback(async () => {
    const doc = getSnapshot();
    if (!doc) return;
    const mode = storageModeRef.current;

    if (mode === 'delta' && saveSnapshot) {
      const currentBaseUrl = baseRefRef.current;
      const currentBaseData = baseDataRef.current;
      if (currentBaseUrl && currentBaseData) {
        const { diff } = await import('jsondiffpatch');
        const delta = diff(currentBaseData, structuredClone(doc));
        onSave(
          delta
            ? { type: 'delta', baseUrl: currentBaseUrl, delta }
            : { type: 'remote', url: currentBaseUrl },
        );
      } else {
        const ref = await saveSnapshot(doc, baseRefRef.current || undefined);
        onSave({ type: 'remote', url: ref });
      }
      return;
    }

    if (mode === 'remote') {
      const ref = baseRefRef.current;
      if (ref) {
        onSave({ type: 'remote', url: ref });
      } else if (saveSnapshot) {
        const newRef = await saveSnapshot(doc);
        onSave({ type: 'remote', url: newRef });
      }
      return;
    }

    // inline
    onSave({ type: 'inline', data: doc });
  }, [onSave, saveSnapshot, getSnapshot]);

  const handleChange = useCallback(
    (elements: readonly any[]) => {
      if (!initializedRef.current) {
        // Skip the first onChange fired during excalidraw mount
        initializedRef.current = true;
        return;
      }
      // Only schedule save when there are actual drawn elements
      if (elements.length === 0) return;
      if (!isDirtyRef.current) {
        isDirtyRef.current = true;
        setIsDirty(true);
      }
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => performSave(), SAVE_DEBOUNCE_MS);
    },
    [performSave],
  );

  const handleSaveAndClose = useCallback(() => {
    void performSave().then(async () => {
      await emitSnapshot();
      onClose(getSnapshot());
      dismiss();
    });
  }, [performSave, emitSnapshot, getSnapshot, onClose, dismiss]);

  const handleDiscard = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    dismiss();
  }, [dismiss]);

  const showConfirmDialog = useCallback(() => {
    if (confirmDialogOpenRef.current) return;
    confirmDialogOpenRef.current = true;
    presentDialog({
      title: 'Unsaved Changes',
      description: 'You have unsaved changes that will be lost if you close now.',
      content: ({ dismiss: dismissConfirm }) => {
        const wrappedDismiss = () => {
          confirmDialogOpenRef.current = false;
          dismissConfirm();
        };
        return (
          <div className={css.excalidrawConfirmActions}>
            <button className={css.excalidrawConfirmBtn} type="button" onClick={wrappedDismiss}>
              Continue Editing
            </button>
            <button
              className={css.excalidrawConfirmBtnDanger}
              type="button"
              onClick={() => {
                wrappedDismiss();
                handleDiscard();
              }}
            >
              Discard
            </button>
            <button
              className={css.excalidrawConfirmBtnPrimary}
              type="button"
              onClick={() => {
                wrappedDismiss();
                handleSaveAndClose();
              }}
            >
              Save & Close
            </button>
          </div>
        );
      },
      portalClassName,
      theme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
    });
  }, [handleDiscard, handleSaveAndClose, portalClassName, theme]);

  const attemptClose = useCallback(() => {
    if (isDirtyRef.current) {
      showConfirmDialog();
    } else {
      void emitSnapshot().then(() => {
        onClose(getSnapshot());
        dismiss();
      });
    }
  }, [dismiss, showConfirmDialog, emitSnapshot, getSnapshot, onClose]);

  // Intercept ESC in capture phase to prevent Base UI auto-dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (confirmDialogOpenRef.current) {
          confirmDialogOpenRef.current = false;
          dismissTopDialog();
        } else {
          attemptClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [attemptClose]);

  const handleManualUpload = useCallback(() => {
    performSave();
  }, [performSave]);

  const handleExportJson = useCallback(() => {
    const doc = getSnapshot();
    if (!doc) return;
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'excalidraw-snapshot.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [getSnapshot]);

  const handleCopyJson = useCallback(() => {
    const doc = getSnapshot();
    if (!doc) return;
    void navigator.clipboard.writeText(JSON.stringify(doc));
  }, [getSnapshot]);

  const handleRefChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSavedRef(value);
    baseRefRef.current = value;
    baseDataRef.current = undefined;
  }, []);

  const handleStorageModeChange = useCallback(
    (newMode: 'inline' | 'remote' | 'delta') => {
      setStorageMode(newMode);
      storageModeRef.current = newMode;
      if (newMode === 'inline') setSavedRef('');
      performSave();
    },
    [performSave],
  );

  return (
    <>
      {/* Header */}
      <div className={css.excalidrawDialogHeader}>
        <span
          className={css.excalidrawStatusDot}
          style={{ backgroundColor: isDirty ? '#f59e0b' : '#22c55e' }}
        />
        <span className={css.excalidrawDialogTitle}>Canvas Editor</span>
        <span className={css.excalidrawDialogMeta}>excalidraw</span>

        <div className={css.excalidrawHeaderActions}>
          {saveSnapshot && (
            <>
              <SegmentedControl
                value={storageMode}
                items={[
                  { value: 'inline', label: 'Inline' },
                  { value: 'remote', label: 'Remote' },
                  { value: 'delta', label: 'Delta' },
                ]}
                onChange={handleStorageModeChange}
              />
              <div className={css.excalidrawActionBarSep} />
              <button
                className={css.excalidrawActionBarBtn}
                disabled={isSaving}
                type="button"
                onClick={handleManualUpload}
              >
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              <div className={css.excalidrawActionBarSep} />
            </>
          )}
          <button className={css.excalidrawActionBarBtn} type="button" onClick={handleExportJson}>
            <Download size={14} />
            JSON
          </button>
          <button className={css.excalidrawActionBarBtn} type="button" onClick={handleCopyJson}>
            <Clipboard size={14} />
            Copy
          </button>
          {storageMode !== 'inline' && (
            <>
              <div className={css.excalidrawActionBarSep} />
              <input
                className={css.excalidrawActionBarUrl}
                placeholder="base URL / ref"
                spellCheck={false}
                type="text"
                value={savedRef}
                onChange={handleRefChange}
              />
            </>
          )}
        </div>

        <button className={css.excalidrawHeaderClose} type="button" onClick={attemptClose}>
          <X size={18} />
        </button>
      </div>

      {/* Canvas */}
      <div className={css.excalidrawDialogCanvas}>
        <ExcalidrawComponent
          initialData={initialData}
          theme={theme}
          excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
            apiRef.current = api;
          }}
          onChange={handleChange}
        />
      </div>
    </>
  );
};

// ── Main component ──────────────────────────────────────────────

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
    baseRef,
    baseData,
  } = useExcalidrawData(snapshot);
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<FC<any> | null>(null);
  const [libLoading, setLibLoading] = useState(true);
  const previewApiRef = useRef<any>(null);
  const initialDataRef = useRef<Record<string, any> | undefined>(undefined);
  const [previewKey, setPreviewKey] = useState(0);
  const onSnapshotChangeRef = useRef(onSnapshotChange);
  onSnapshotChangeRef.current = onSnapshotChange;
  const saveSnapshotRef = useRef(saveSnapshot);
  saveSnapshotRef.current = saveSnapshot;
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  const { className: portalClassName } = usePortalTheme();

  useEffect(() => {
    if (initialData && !initialDataRef.current) {
      initialDataRef.current = initialData;
    }
  }, [initialData]);

  useEffect(() => {
    import('@excalidraw/excalidraw')
      .then((mod: any) => {
        const Comp = mod.Excalidraw || mod.default?.Excalidraw;
        if (Comp) setExcalidrawComponent(() => Comp);
        setLibLoading(false);
      })
      .catch(() => setLibLoading(false));
  }, []);

  const baseRefRef = useRef(baseRef);
  const baseDataRefOuter = useRef(baseData);
  useEffect(() => {
    if (baseRef) baseRefRef.current = baseRef;
  }, [baseRef]);
  useEffect(() => {
    if (baseData) baseDataRefOuter.current = baseData;
  }, [baseData]);

  const handleOpenEditor = useCallback(() => {
    if (!ExcalidrawComponent || dataLoading) return;
    presentDialog({
      content: ({ dismiss }) => (
        <ExcalidrawEditorDialogContent
          ExcalidrawComponent={ExcalidrawComponent}
          baseData={baseDataRefOuter.current}
          baseRef={baseRefRef.current}
          dismiss={dismiss}
          initialData={initialDataRef.current}
          initialSnapshot={snapshotRef.current}
          saveSnapshot={saveSnapshotRef.current}
          theme={theme}
          onSave={(ref) => onSnapshotChangeRef.current(ref)}
          onClose={(doc) => {
            if (doc) {
              initialDataRef.current = doc;
              setPreviewKey((k) => k + 1);
            }
          }}
        />
      ),
      className: css.excalidrawFullscreenPopup,
      portalClassName,
      theme,
      showCloseButton: false,
      clickOutsideToDismiss: false,
    });
  }, [ExcalidrawComponent, dataLoading, theme, portalClassName]);

  const loading = dataLoading || libLoading;

  if (loading || !ExcalidrawComponent) {
    return (
      <div className={css.excalidrawEditorContainer}>
        <div className={css.excalidrawLoading}>Loading excalidraw editor...</div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className={css.excalidrawEditorContainer}>
        <div className={css.excalidrawError}>{dataError}</div>
      </div>
    );
  }

  return (
    <div className={css.excalidrawEditorContainer}>
      <ExcalidrawComponent
        viewModeEnabled
        zenModeEnabled
        UIOptions={readonlyUIOptions}
        initialData={initialDataRef.current}
        key={previewKey}
        theme={theme}
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
          previewApiRef.current = api;
          setTimeout(() => api.scrollToContent(), 100);
        }}
      />

      <button className={css.excalidrawEditOverlay} type="button" onClick={handleOpenEditor}>
        <span className={css.excalidrawEditLabel}>
          <Pencil size={16} />
          Edit Whiteboard
        </span>
      </button>
    </div>
  );
};
