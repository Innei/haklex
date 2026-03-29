import type { AgentStore } from '@haklex/rich-agent-core';
import { decorateSubtree, diffModifiedNode } from '@haklex/rich-diff-core';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { RichRenderer } from '@haklex/rich-static-renderer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getState, type SerializedLexicalNode } from 'lexical';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  deleteOverlay,
  diffPanel,
  diffPanelDelete,
  insertMarker,
  overlayContainer,
  replaceOverlay,
} from './diff-review-overlay.css';

function getBlockId(node: SerializedLexicalNode): string | undefined {
  return (node as any).$?.blockId as string | undefined;
}

function wrapDoc(nodes: SerializedLexicalNode[]) {
  return {
    root: {
      children: nodes,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

type OverlayEntry = {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  top: number;
  height: number;
  oldNode?: SerializedLexicalNode;
  newNode?: SerializedLexicalNode;
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
        const baseChildren = (batch.baseSnapshot.root as any).children as SerializedLexicalNode[];
        const blockMap = new Map<string, SerializedLexicalNode>();
        for (const c of baseChildren) {
          const bid = getBlockId(c);
          if (bid) blockMap.set(bid, c);
        }

        for (const entry of batch.entries) {
          const blockId = entry.targetBlockId;
          if (!blockId) continue;

          const child = children.find((c) => $getState(c, blockIdState) === blockId);
          if (!child) continue;

          const key = child.getKey();
          const domEl = editor.getElementByKey(key);
          if (!domEl) continue;

          const rect = domEl.getBoundingClientRect();
          const oldNode = blockMap.get(blockId);

          let newNode: SerializedLexicalNode | undefined;
          if (entry.op.op === 'insert' || entry.op.op === 'replace') {
            newNode = entry.op.node;
          }

          entries.push({
            id: entry.id,
            type: entry.op.op as 'insert' | 'delete' | 'replace',
            top: rect.top - rootRect.top,
            height: rect.height,
            oldNode,
            newNode,
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
        if (o.type === 'delete' && o.oldNode) {
          const decorated = decorateSubtree(o.oldNode, 'delete');
          return (
            <div key={o.id}>
              <div className={deleteOverlay} style={{ top: o.top, height: o.height }} />
              <div className={diffPanelDelete} style={{ top: o.top, height: o.height }}>
                <RichRenderer value={wrapDoc([decorated])} />
              </div>
            </div>
          );
        }

        if (o.type === 'insert' && o.newNode) {
          const decorated = decorateSubtree(o.newNode, 'insert');
          return (
            <div key={o.id}>
              <div className={insertMarker} style={{ top: o.top, height: 3 }} />
              <div className={diffPanel} style={{ top: o.top + 3 }}>
                <RichRenderer value={wrapDoc([decorated])} />
              </div>
            </div>
          );
        }

        if (o.type === 'replace' && o.oldNode && o.newNode) {
          const { oldNode: decoratedOld, newNode: decoratedNew } = diffModifiedNode(
            o.oldNode,
            o.newNode,
          );
          return (
            <div key={o.id}>
              <div className={replaceOverlay} style={{ top: o.top, height: o.height }} />
              <div className={diffPanelDelete} style={{ top: o.top, height: o.height }}>
                <RichRenderer value={wrapDoc([decoratedOld])} />
              </div>
              <div className={diffPanel} style={{ top: o.top + o.height }}>
                <RichRenderer value={wrapDoc([decoratedNew])} />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>,
    containerEl,
  );
}
