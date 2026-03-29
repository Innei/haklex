import type { AgentStore, ReviewEntry } from '@haklex/rich-agent-core';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getState } from 'lexical';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  deleteOverlay,
  ghostPreview,
  insertMarker,
  overlayContainer,
  replaceOverlay,
} from './diff-review-overlay.css';

function extractText(node: any): string {
  if (node.text) return node.text;
  if (node.children) return node.children.map(extractText).join('');
  return '';
}

function getPreviewText(entry: ReviewEntry): string {
  const { op } = entry;
  if (op.op === 'insert' || op.op === 'replace') {
    return op.node ? extractText(op.node) : '';
  }
  return '';
}

type OverlayEntry = {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  top: number;
  height: number;
  previewText: string;
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
            previewText: getPreviewText(entry),
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
        if (o.type === 'delete') {
          return (
            <div className={deleteOverlay} key={o.id} style={{ top: o.top, height: o.height }} />
          );
        }

        if (o.type === 'insert') {
          return (
            <div key={o.id}>
              <div className={insertMarker} style={{ top: o.top, height: 3 }} />
              {o.previewText && (
                <div className={ghostPreview} style={{ top: o.top + 3 }}>
                  {o.previewText}
                </div>
              )}
            </div>
          );
        }

        // replace
        return (
          <div key={o.id}>
            <div className={replaceOverlay} style={{ top: o.top, height: o.height }} />
            {o.previewText && (
              <div className={ghostPreview} style={{ top: o.top + o.height }}>
                {o.previewText}
              </div>
            )}
          </div>
        );
      })}
    </div>,
    containerEl,
  );
}
