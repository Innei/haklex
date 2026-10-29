import type {
  AppState,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from '@excalidraw/excalidraw/types';
import {
  dismissTopDialog,
  ModalShell,
  ModalShellBody,
  ModalShellFooter,
  ModalShellHeader,
  toast,
} from '@haklex/rich-editor-ui';
import { PenLine } from 'lucide-react';
import type { ComponentType, FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { appStateOwnsEscape, sceneSignature, targetOwnsEscape } from './canvas-state';
import type { ExcalidrawStorageMode } from './ExcalidrawOptionsMenu';
import { ExcalidrawOptionsMenu } from './ExcalidrawOptionsMenu';
import * as css from './styles.css';
import type { ExcalidrawSnapshot } from './types';

type SceneDoc = Record<string, any>;

export interface ExcalidrawEditorDialogProps {
  baseData?: SceneDoc;
  baseRef?: string;
  dismiss: () => void;
  ExcalidrawComponent: ComponentType<ExcalidrawProps>;
  holdEscapeDismiss?: () => void;
  initialData: SceneDoc | undefined;
  initialSnapshot: ExcalidrawSnapshot | null;
  isConfirming: () => boolean;
  onClose: (doc?: SceneDoc) => void;
  onDirtyChange: (dirty: boolean) => void;
  onSave: (snapshot: ExcalidrawSnapshot) => void;
  requestDismiss: () => void;
  saveSnapshot?: (snapshot: object, existingRef?: string) => Promise<string>;
  theme: 'light' | 'dark';
}

function initialStorageMode(
  saveSnapshot: ExcalidrawEditorDialogProps['saveSnapshot'],
  snapshot: ExcalidrawSnapshot | null,
): ExcalidrawStorageMode {
  if (!saveSnapshot || !snapshot) return 'inline';
  if (snapshot.type === 'delta') return 'delta';
  if (snapshot.type === 'remote') return 'remote';
  return 'inline';
}

function initialRef(
  saveSnapshot: ExcalidrawEditorDialogProps['saveSnapshot'],
  snapshot: ExcalidrawSnapshot | null,
): string {
  if (!saveSnapshot || !snapshot) return '';
  if (snapshot.type === 'remote') return snapshot.url;
  if (snapshot.type === 'delta') return snapshot.baseUrl;
  return '';
}

export const ExcalidrawEditorDialog: FC<ExcalidrawEditorDialogProps> = ({
  baseData,
  baseRef,
  dismiss,
  holdEscapeDismiss,
  ExcalidrawComponent,
  initialData,
  initialSnapshot,
  isConfirming,
  onClose,
  onDirtyChange,
  onSave,
  requestDismiss,
  saveSnapshot,
  theme,
}) => {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const baselineRef = useRef<string | null>(null);
  const stableRef = useRef(false);
  const baseRefRef = useRef(baseRef);
  const baseDataRef = useRef(baseData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [storageMode, setStorageMode] = useState(() =>
    initialStorageMode(saveSnapshot, initialSnapshot),
  );
  const [refValue, setRefValue] = useState(() => initialRef(saveSnapshot, initialSnapshot));

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    const stableTimer = setTimeout(() => {
      stableRef.current = true;
    }, 500);
    return () => clearTimeout(stableTimer);
  }, []);

  const getSnapshot = useCallback((): SceneDoc | undefined => {
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

  const uploadBase = useCallback(
    async (doc: SceneDoc) => {
      if (!saveSnapshot || storageMode === 'inline') return;
      if (storageMode === 'delta' && baseRefRef.current && baseDataRef.current) return;
      if (
        storageMode === 'remote' &&
        baseRefRef.current &&
        baseDataRef.current &&
        JSON.stringify(doc) === JSON.stringify(baseDataRef.current)
      ) {
        return;
      }
      const ref = await saveSnapshot(doc, baseRefRef.current || undefined);
      baseRefRef.current = ref;
      baseDataRef.current = doc;
      setRefValue(ref);
    },
    [saveSnapshot, storageMode],
  );

  const composeSnapshot = useCallback(
    async (doc: SceneDoc): Promise<ExcalidrawSnapshot | undefined> => {
      if (storageMode === 'inline' || !saveSnapshot) return { type: 'inline', data: doc };
      const ref = baseRefRef.current;
      if (!ref) return;
      if (storageMode === 'delta' && baseDataRef.current) {
        const { diff } = await import('jsondiffpatch');
        const delta = diff(baseDataRef.current, structuredClone(doc));
        return delta ? { type: 'delta', baseUrl: ref, delta } : { type: 'remote', url: ref };
      }
      return { type: 'remote', url: ref };
    },
    [saveSnapshot, storageMode],
  );

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    const doc = getSnapshot();
    if (!doc) return;
    setIsSaving(true);
    try {
      await uploadBase(doc);
      const snapshot = await composeSnapshot(doc);
      if (!snapshot) return;
      onSave(snapshot);
      onClose(doc);
      setIsDirty(false);
      dismiss();
    } catch {
      toast({ title: 'Couldn’t save the whiteboard', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, getSnapshot, uploadBase, composeSnapshot, onSave, onClose, dismiss]);

  const handleChange = useCallback((elements: readonly unknown[], appState?: AppState) => {
    const signature = sceneSignature(elements, appState);
    if (baselineRef.current === null || !stableRef.current) {
      baselineRef.current = signature;
      return;
    }
    if (signature !== baselineRef.current) setIsDirty(true);
  }, []);

  const optionsOpenRef = useRef(optionsOpen);
  optionsOpenRef.current = optionsOpen;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || optionsOpenRef.current) return;
      if (
        !isConfirming() &&
        (targetOwnsEscape(event.target) || appStateOwnsEscape(apiRef.current?.getAppState()))
      ) {
        holdEscapeDismiss?.();
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isConfirming()) dismissTopDialog();
      else requestDismiss();
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [holdEscapeDismiss, isConfirming, requestDismiss]);

  const handleExportJson = useCallback(() => {
    const doc = getSnapshot();
    if (!doc) return;
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'excalidraw-snapshot.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [getSnapshot]);

  const handleCopyJson = useCallback(() => {
    const doc = getSnapshot();
    if (!doc) return;
    navigator.clipboard.writeText(JSON.stringify(doc)).then(
      () => toast({ title: 'Copied', tone: 'success' }),
      () => toast({ title: 'Couldn’t copy', tone: 'error' }),
    );
  }, [getSnapshot]);

  const handleRefChange = useCallback((value: string) => {
    setRefValue(value);
    baseRefRef.current = value;
    baseDataRef.current = undefined;
    setIsDirty(true);
  }, []);

  const handleStorageModeChange = useCallback((mode: ExcalidrawStorageMode) => {
    setStorageMode(mode);
    if (mode === 'inline') setRefValue('');
    setIsDirty(true);
  }, []);

  const status = isSaving ? 'Saving…' : isDirty ? 'Unsaved changes' : 'Saved';

  return (
    <ModalShell className={css.excalidrawShell} onSave={handleSave}>
      <ModalShellHeader
        icon={<PenLine />}
        title="Whiteboard"
        actions={
          <ExcalidrawOptionsMenu
            open={optionsOpen}
            storage={
              saveSnapshot
                ? {
                    mode: storageMode,
                    onModeChange: handleStorageModeChange,
                    onRefChange: handleRefChange,
                    refValue,
                  }
                : undefined
            }
            onCopy={handleCopyJson}
            onExport={handleExportJson}
            onOpenChange={setOptionsOpen}
          />
        }
        onClose={requestDismiss}
      />
      <ModalShellBody className={css.excalidrawDialogCanvas}>
        <ExcalidrawComponent
          initialData={initialData}
          theme={theme}
          excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
            apiRef.current = api;
          }}
          onChange={handleChange}
        />
      </ModalShellBody>
      <ModalShellFooter
        dirty={isDirty}
        saveDisabled={isSaving}
        status={
          <>
            {!isDirty && !isSaving && <span aria-hidden className={css.excalidrawSavedDot} />}
            {status}
          </>
        }
        onCancel={requestDismiss}
        onSave={handleSave}
      />
    </ModalShell>
  );
};
