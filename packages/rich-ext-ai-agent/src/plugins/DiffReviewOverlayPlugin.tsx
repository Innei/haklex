import type { AgentStore } from '@haklex/rich-agent-core';
import { decorateSubtree, diffModifiedNode } from '@haklex/rich-diff-core';
import { blockIdState } from '@haklex/rich-editor/plugins';
import {
  useColorScheme,
  useExtraNodes,
  useRendererConfig,
  useVariant,
} from '@haklex/rich-editor/static';
import { RichRenderer } from '@haklex/rich-static-renderer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getState, type SerializedLexicalNode } from 'lexical';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { diffPanel, diffPanelDelete, overlayContainer } from './diff-review-overlay.css';

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
  blockEl: HTMLElement | null;
  oldNode?: SerializedLexicalNode;
  newNode?: SerializedLexicalNode;
};

const DELETE_BG = 'rgba(239, 68, 68, 0.08)';
const DELETE_BORDER = '3px solid rgb(239, 68, 68)';

export function DiffReviewOverlayPlugin({ store }: { store: AgentStore }): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [overlays, setOverlays] = useState<OverlayEntry[]>([]);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const theme = useColorScheme();
  const variant = useVariant();
  const rendererConfig = useRendererConfig();
  const extraNodes = useExtraNodes();

  // Track panel heights via ResizeObserver to set block margins
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  const observerRef = useRef<ResizeObserver | null>(null);

  const syncMargins = useCallback(() => {
    for (const o of overlays) {
      if (!o.blockEl) continue;
      const panel = panelRefs.current.get(o.id);
      if (panel) {
        o.blockEl.style.marginBottom = `${panel.offsetHeight}px`;
      }
    }
  }, [overlays]);

  useEffect(() => {
    const observer = new ResizeObserver(() => syncMargins());
    observerRef.current = observer;
    for (const el of panelRefs.current.values()) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [syncMargins]);

  const panelRefCallback = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        panelRefs.current.set(id, el);
        observerRef.current?.observe(el);
      } else {
        panelRefs.current.delete(id);
      }
    },
    [],
  );

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

    const container = rootEl.parentElement ?? rootEl;
    const containerRect = container.getBoundingClientRect();
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
          if (entry.op.op === 'insert') {
            if (!entry.op.node?.type) continue;
            const anchorId = (entry as any).anchorBeforeId || (entry as any).anchorAfterId;
            if (!anchorId) continue;
            const anchorChild = children.find((c) => $getState(c, blockIdState) === anchorId);
            if (!anchorChild) continue;
            const domEl = editor.getElementByKey(anchorChild.getKey());
            if (!domEl) continue;
            const rect = domEl.getBoundingClientRect();

            entries.push({
              id: entry.id,
              type: 'insert',
              top: rect.bottom - containerRect.top,
              height: 0,
              blockEl: domEl,
              newNode: entry.op.node,
            });
            continue;
          }

          const blockId = entry.targetBlockId;
          if (!blockId) continue;

          const child = children.find((c) => $getState(c, blockIdState) === blockId);
          if (!child) continue;

          const domEl = editor.getElementByKey(child.getKey());
          if (!domEl) continue;

          const rect = domEl.getBoundingClientRect();

          entries.push({
            id: entry.id,
            type: entry.op.op as 'delete' | 'replace',
            top: rect.top - containerRect.top,
            height: rect.height,
            blockEl: domEl,
            oldNode: blockMap.get(blockId),
            newNode: entry.op.op === 'replace' ? entry.op.node : undefined,
          });
        }
      }
    });

    setOverlays(entries);
  }, [editor, store]);

  // Apply block inline styles & margins
  useEffect(() => {
    for (const o of overlays) {
      if (!o.blockEl) continue;
      if (o.type === 'delete') {
        o.blockEl.style.background = DELETE_BG;
        o.blockEl.style.borderLeft = DELETE_BORDER;
        o.blockEl.style.textDecoration = 'line-through';
        o.blockEl.style.textDecorationColor = 'rgb(239, 68, 68)';
      } else if (o.type === 'replace') {
        o.blockEl.style.background = DELETE_BG;
        o.blockEl.style.borderLeft = DELETE_BORDER;
      }
    }
    syncMargins();

    return () => {
      for (const o of overlays) {
        if (!o.blockEl) continue;
        o.blockEl.style.background = '';
        o.blockEl.style.borderLeft = '';
        o.blockEl.style.textDecoration = '';
        o.blockEl.style.textDecorationColor = '';
        o.blockEl.style.marginBottom = '';
      }
    };
  }, [overlays, syncMargins]);

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

  useEffect(() => {
    computeOverlays();
  }, [computeOverlays]);

  if (!containerEl || overlays.length === 0) return null;

  return createPortal(
    <div className={overlayContainer}>
      {overlays.map((o) => {
        if (o.type === 'delete') {
          return null;
        }

        if (o.type === 'insert' && o.newNode) {
          const decorated = decorateSubtree(o.newNode, 'insert');
          return (
            <div
              className={diffPanel}
              key={o.id}
              ref={panelRefCallback(o.id)}
              style={{ position: 'absolute', top: o.top, left: 0, right: 0 }}
            >
              <RichRenderer
                extraNodes={extraNodes}
                rendererConfig={rendererConfig}
                theme={theme}
                value={wrapDoc([decorated])}
                variant={variant}
              />
            </div>
          );
        }

        if (o.type === 'replace' && o.oldNode && o.newNode) {
          const { oldNode: decoratedOld, newNode: decoratedNew } = diffModifiedNode(
            o.oldNode,
            o.newNode,
          );
          return (
            <div
              key={o.id}
              ref={panelRefCallback(o.id)}
              style={{ position: 'absolute', top: o.top + o.height, left: 0, right: 0 }}
            >
              <div className={diffPanelDelete}>
                <RichRenderer
                  extraNodes={extraNodes}
                  rendererConfig={rendererConfig}
                  theme={theme}
                  value={wrapDoc([decoratedOld])}
                  variant={variant}
                />
              </div>
              <div className={diffPanel}>
                <RichRenderer
                  extraNodes={extraNodes}
                  rendererConfig={rendererConfig}
                  theme={theme}
                  value={wrapDoc([decoratedNew])}
                  variant={variant}
                />
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
