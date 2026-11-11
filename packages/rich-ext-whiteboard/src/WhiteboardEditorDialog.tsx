import {
  dismissTopDialog,
  ModalShell,
  ModalShellBody,
  ModalShellFooter,
  ModalShellHeader,
  toast,
} from '@haklex/rich-editor-ui';
import { PenLine } from 'lucide-react';
import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { editorOwnsEscape, isEditorTarget, releaseEscape } from './canvas-state';
import { useNarrowLayout } from './editor/layout';
import { createWhiteboardStore, useStore } from './editor/store';
import { WhiteboardToolbar } from './editor/Toolbar';
import { WhiteboardEditor } from './editor/WhiteboardEditor';
import * as css from './styles.css';
import type { WhiteboardSnapshot } from './types';
import type { WhiteboardStorageMode } from './WhiteboardOptionsMenu';
import { WhiteboardOptionsMenu } from './WhiteboardOptionsMenu';

type SceneDoc = Record<string, any>;

export interface WhiteboardEditorDialogProps {
  baseData?: SceneDoc;
  baseRef?: string;
  dismiss: () => void;
  holdEscapeDismiss?: () => void;
  initialData: SceneDoc | undefined;
  initialSnapshot: WhiteboardSnapshot | null;
  isConfirming: () => boolean;
  onClose: (doc?: SceneDoc) => void;
  onDirtyChange: (dirty: boolean) => void;
  onSave: (snapshot: WhiteboardSnapshot) => void;
  onUploadError?: (error: unknown) => void;
  requestDismiss: () => void;
  saveSnapshot?: (snapshot: object, existingRef?: string) => Promise<string>;
  theme: 'light' | 'dark';
  uploadFile?: (file: File) => Promise<string>;
}

const defaultUploadError = () =>
  toast({ title: 'Couldn’t upload the image; it is kept inside the whiteboard', tone: 'error' });

function initialStorageMode(
  saveSnapshot: WhiteboardEditorDialogProps['saveSnapshot'],
  snapshot: WhiteboardSnapshot | null,
): WhiteboardStorageMode {
  if (!saveSnapshot || !snapshot) return 'inline';
  if (snapshot.type === 'delta') return 'delta';
  if (snapshot.type === 'remote') return 'remote';
  return 'inline';
}

function initialRef(
  saveSnapshot: WhiteboardEditorDialogProps['saveSnapshot'],
  snapshot: WhiteboardSnapshot | null,
): string {
  if (!saveSnapshot || !snapshot) return '';
  if (snapshot.type === 'remote') return snapshot.url;
  if (snapshot.type === 'delta') return snapshot.baseUrl;
  return '';
}

export const WhiteboardEditorDialog: FC<WhiteboardEditorDialogProps> = ({
  baseData,
  baseRef,
  dismiss,
  holdEscapeDismiss,
  initialData,
  initialSnapshot,
  isConfirming,
  onClose,
  onDirtyChange,
  onSave,
  onUploadError = defaultUploadError,
  requestDismiss,
  saveSnapshot,
  theme,
  uploadFile,
}) => {
  const [store] = useState(() => createWhiteboardStore(initialData));
  const bodyRef = useRef<HTMLDivElement>(null);
  const baseRefRef = useRef(baseRef);
  const baseDataRef = useRef(baseData);
  const narrow = useNarrowLayout(store);
  const [sceneDirty, setSceneDirty] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDirty = !saved && (sceneDirty || settingsDirty);
  const [isSaving, setIsSaving] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [storageMode, setStorageMode] = useState(() =>
    initialStorageMode(saveSnapshot, initialSnapshot),
  );
  const [refValue, setRefValue] = useState(() => initialRef(saveSnapshot, initialSnapshot));

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => store.subscribe(() => setSceneDirty(store.isDirty())), [store]);

  const focusCanvas = useCallback(() => {
    queueMicrotask(() =>
      bodyRef.current
        ?.querySelector<HTMLElement>('[data-whiteboard-canvas]')
        ?.focus({ preventScroll: true }),
    );
  }, []);

  const getSnapshot = useCallback((): SceneDoc => store.getScene() as SceneDoc, [store]);

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
    async (doc: SceneDoc): Promise<WhiteboardSnapshot | undefined> => {
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

  const uploading = useStore(store, (s) =>
    s.elements.some((el) => el.type === 'image' && !el.isDeleted && el.status === 'pending'),
  );

  const handleSave = useCallback(async () => {
    if (isSaving || uploading) return;
    const doc = getSnapshot();
    if (!doc) return;
    setIsSaving(true);
    try {
      await uploadBase(doc);
      const snapshot = await composeSnapshot(doc);
      if (!snapshot) return;
      onSave(snapshot);
      onClose(doc);
      setSaved(true);
      dismiss();
    } catch {
      toast({ title: 'Couldn’t save the whiteboard', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, uploading, getSnapshot, uploadBase, composeSnapshot, onSave, onClose, dismiss]);

  const optionsOpenRef = useRef(optionsOpen);
  optionsOpenRef.current = optionsOpen;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || optionsOpenRef.current) return;
      if (!isConfirming() && editorOwnsEscape(store)) {
        holdEscapeDismiss?.();
        if (isEditorTarget(event.target)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        releaseEscape(store, bodyRef.current?.querySelector('[data-whiteboard-canvas]') ?? null);
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isConfirming()) dismissTopDialog();
      else requestDismiss();
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [holdEscapeDismiss, isConfirming, requestDismiss, store]);

  const handleExportJson = useCallback(() => {
    const doc = getSnapshot();
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
    navigator.clipboard.writeText(JSON.stringify(doc)).then(
      () => toast({ title: 'Copied', tone: 'success' }),
      () => toast({ title: 'Couldn’t copy', tone: 'error' }),
    );
  }, [getSnapshot]);

  const handleRefChange = useCallback((value: string) => {
    setRefValue(value);
    baseRefRef.current = value;
    baseDataRef.current = undefined;
    setSettingsDirty(true);
  }, []);

  const handleStorageModeChange = useCallback((mode: WhiteboardStorageMode) => {
    setStorageMode(mode);
    if (mode === 'inline') setRefValue('');
    setSettingsDirty(true);
  }, []);

  const status = isSaving
    ? 'Saving…'
    : uploading
      ? 'Uploading image…'
      : isDirty
        ? 'Unsaved changes'
        : 'Saved';

  return (
    <ModalShell className={css.whiteboardShell} onSave={handleSave}>
      <ModalShellHeader
        center={narrow ? undefined : <WhiteboardToolbar store={store} onToolSelect={focusCanvas} />}
        icon={<PenLine />}
        title="Whiteboard"
        actions={
          <WhiteboardOptionsMenu
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
      <ModalShellBody className={css.whiteboardDialogCanvas}>
        <div className={css.whiteboardDialogBody} ref={bodyRef}>
          <WhiteboardEditor
            store={store}
            theme={theme}
            toolbar="none"
            uploadFile={uploadFile}
            onUploadError={onUploadError}
          />
        </div>
      </ModalShellBody>
      <ModalShellFooter
        dirty={isDirty}
        saveDisabled={isSaving || uploading}
        status={
          <>
            {!isDirty && !isSaving && <span aria-hidden className={css.whiteboardSavedDot} />}
            {status}
          </>
        }
        onCancel={requestDismiss}
        onSave={handleSave}
      />
    </ModalShell>
  );
};
