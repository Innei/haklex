import type { AnnotationState, MarkerBaseEditor } from '@markerjs/markerjs3';
import { MarkerArea, TextMarkerEditor } from '@markerjs/markerjs3';
import type { FC, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { AnnotationTool } from './annotation';
import { MARKER_TYPE_BY_TOOL } from './annotation';
import * as css from './styles.css';

export interface AnnotationApi {
  redo: () => void;
  undo: () => void;
}

export interface AnnotationSurfaceProps {
  apiRef: RefObject<AnnotationApi | null>;
  counterRef: RefObject<number>;
  onDecodeError: () => void;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  sourceUrl: string;
  // Survives surface remounts (tool/bitmap switches) — owned by the modal.
  stateRef: RefObject<AnnotationState | null>;
  strokeColor: string;
  strokeWidth: number;
  tool: AnnotationTool;
}

const TEXT_TOOLS = new Set<AnnotationTool>(['counter', 'text']);

export const AnnotationSurface: FC<AnnotationSurfaceProps> = ({
  apiRef,
  counterRef,
  onDecodeError,
  onHistoryChange,
  sourceUrl,
  stateRef,
  strokeColor,
  strokeWidth,
  tool,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<MarkerArea | null>(null);
  const syncRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);

  const settingsRef = useRef({ strokeColor, strokeWidth, tool });
  settingsRef.current = { strokeColor, strokeWidth, tool };

  const callbacksRef = useRef({ onDecodeError, onHistoryChange });
  callbacksRef.current = { onDecodeError, onHistoryChange };

  const styleEditorRef = useRef((editor: MarkerBaseEditor, isNew: boolean) => {
    void editor;
    void isNew;
  });
  styleEditorRef.current = (editor: MarkerBaseEditor, isNew: boolean) => {
    const settings = settingsRef.current;
    if (settings.tool === 'cover') {
      editor.fillColor = settings.strokeColor;
    } else if (editor.is(TextMarkerEditor)) {
      editor.color = settings.strokeColor;
      if (isNew && settings.tool === 'counter') {
        editor.marker.text = String(counterRef.current);
      }
    } else {
      editor.strokeColor = settings.strokeColor;
      editor.strokeWidth = settings.strokeWidth;
    }
  };

  const armRef = useRef(() => {});
  armRef.current = () => {
    const area = areaRef.current;
    if (!area) return;
    const editor = area.createMarker(MARKER_TYPE_BY_TOOL[settingsRef.current.tool]);
    if (editor) styleEditorRef.current(editor, true);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const area = new MarkerArea();
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = sourceUrl;

    const sync = () => {
      stateRef.current = area.getState();
      callbacksRef.current.onHistoryChange(area.isUndoPossible, area.isRedoPossible);
    };

    const handleCreate = () => {
      if (settingsRef.current.tool === 'counter') counterRef.current += 1;
      sync();
      // Repeat-draw for shape tools. Text tools re-arm on deselect instead:
      // re-arming here would deselect the marker and close its text editor.
      if (!TEXT_TOOLS.has(settingsRef.current.tool)) armRef.current();
    };

    // Arming mid-gesture crashes markerjs3: MarkerArea routes the window
    // pointerup to the freshly armed editor, whose marker has no visual yet
    // (created on pointerDown), and its stateChanged() -> getState() throws.
    // Track the gesture so deselect-triggered re-arms wait for pointer release.
    let pointerActive = false;
    let armPending = false;
    const tryArm = () => {
      if (disposed) return;
      if (area.currentMarkerEditor || area.selectedMarkerEditors.length > 0) return;
      if (pointerActive) {
        armPending = true;
        return;
      }
      armRef.current();
    };
    const handlePointerDown = () => {
      pointerActive = true;
    };
    const handlePointerRelease = () => {
      pointerActive = false;
      if (!armPending) return;
      armPending = false;
      // markerjs3's own window pointerup handler must finish first.
      setTimeout(tryArm, 0);
    };
    container.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointerup', handlePointerRelease);
    window.addEventListener('pointercancel', handlePointerRelease);

    const handleDeselect = () => {
      if (!TEXT_TOOLS.has(settingsRef.current.tool)) return;
      setTimeout(tryArm, 0);
    };

    img
      .decode()
      .then(() => {
        if (disposed) return;
        area.targetImage = img;
        area.autoZoomOut = true;
        area.addEventListener('markercreate', handleCreate);
        area.addEventListener('markerchange', sync);
        area.addEventListener('markerdelete', sync);
        area.addEventListener('areastatechange', sync);
        area.addEventListener('markerdeselect', handleDeselect);
        container.append(area);
        areaRef.current = area;
        if (stateRef.current) area.restoreState(stateRef.current, false);
        // Only publish sync after attach+restore: a sync bound to a not-yet
        // restored area would getState() on an empty canvas and wipe stateRef.
        syncRef.current = sync;
        setReady(true);
      })
      .catch(() => {
        if (!disposed) callbacksRef.current.onDecodeError();
      });

    return () => {
      disposed = true;
      container.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointerup', handlePointerRelease);
      window.removeEventListener('pointercancel', handlePointerRelease);
      if (areaRef.current === area) {
        stateRef.current = area.getState();
        areaRef.current = null;
      }
      syncRef.current = () => {};
      // Disable undo/redo buttons until the next surface finishes restoring.
      callbacksRef.current.onHistoryChange(false, false);
      area.remove();
      setReady(false);
    };
    // Invariant: sourceUrl never changes while an annotation tool is active
    // (crop unmounts this surface); the cleanup state-save relies on this.
  }, [sourceUrl, stateRef, counterRef]);

  useEffect(() => {
    if (!ready) return;
    armRef.current();
  }, [ready, tool]);

  useEffect(() => {
    if (!ready) return;
    const area = areaRef.current;
    if (!area) return;
    for (const editor of area.selectedMarkerEditors) {
      styleEditorRef.current(editor, false);
    }
    syncRef.current();
    armRef.current();
  }, [ready, strokeColor, strokeWidth]);

  useEffect(() => {
    apiRef.current = {
      redo: () => {
        const area = areaRef.current;
        if (!area) return;
        area.redo();
        syncRef.current();
        armRef.current();
      },
      undo: () => {
        const area = areaRef.current;
        if (!area) return;
        area.undo();
        syncRef.current();
        armRef.current();
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef]);

  return <div className={css.annotationSurface} ref={containerRef} />;
};
