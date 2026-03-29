import type { AgentStore } from '@haklex/rich-agent-core';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getState } from 'lexical';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  deleteOverlay,
  insertMarker,
  overlayContainer,
  replaceOverlay,
} from './diff-review-overlay.css';

type OverlayEntry = {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  top: number;
  height: number;
};

export function DiffReviewOverlayPlugin({ store }: { store: AgentStore }): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [overlays, setOverlays] = useState<OverlayEntry[]>([]);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);

  const computeOverlays = useCallback(() => {
    const reviewState = store.getState().reviewState;
    if (!reviewState) {
      setOverlays([]);
      return;
    }

    const pendingBatches = reviewState.batches.filter((b) => b.status === 'pending');
    if (pendingBatches.length === 0) {
      setOverlays([]);
      return;
    }

    const rootEl = editor.getRootElement();
    if (!rootEl) return;

    const rootRect = rootEl.getBoundingClientRect();
    const entries: OverlayEntry[] = [];

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();

      for (const batch of pendingBatches) {
        for (const entry of batch.entries) {
          const blockId = entry.targetBlockId;
          if (!blockId) continue;

          const child = children.find((c) => $getState(c, blockIdState) === blockId);
          if (!child) continue;

          const key = child.getKey();
          const domEl = editor.getElementByKey(key);
          if (!domEl) continue;

          const rect = domEl.getBoundingClientRect();
          entries.push({
            id: entry.id,
            type: entry.op.op as 'insert' | 'delete' | 'replace',
            top: rect.top - rootRect.top,
            height: rect.height,
          });
        }
      }
    });

    setOverlays(entries);
  }, [editor, store]);

  useEffect(() => {
    const rootEl = editor.getRootElement();
    if (rootEl) {
      const wrapper = rootEl.parentElement;
      if (wrapper) {
        wrapper.style.position = 'relative';
        setContainerEl(wrapper);
      }
    }
  }, [editor]);

  useEffect(() => {
    const unsub = store.subscribe(() => computeOverlays());
    return unsub;
  }, [store, computeOverlays]);

  useEffect(() => {
    return editor.registerUpdateListener(() => computeOverlays());
  }, [editor, computeOverlays]);

  if (!containerEl || overlays.length === 0) return null;

  return createPortal(
    <div className={overlayContainer}>
      {overlays.map((o) => {
        const cls =
          o.type === 'delete' ? deleteOverlay : o.type === 'insert' ? insertMarker : replaceOverlay;
        return (
          <div
            className={cls}
            key={o.id}
            style={{
              top: o.top,
              height: o.type === 'insert' ? 3 : o.height,
            }}
          />
        );
      })}
    </div>,
    containerEl,
  );
}
