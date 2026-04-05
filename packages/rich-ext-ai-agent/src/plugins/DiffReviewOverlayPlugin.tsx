import type { AgentStore } from '@haklex/rich-agent-core';
import { decorateSubtree, diffModifiedNode } from '@haklex/rich-diff-core';
import {
  useColorScheme,
  useExtraNodes,
  useRendererConfig,
  useVariant,
} from '@haklex/rich-editor/static';
import { RichRenderer } from '@haklex/rich-static-renderer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $parseSerializedNode,
  type LexicalEditor,
  type LexicalNode,
  type SerializedLexicalNode,
} from 'lexical';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  batchHeader,
  batchHeaderAccept,
  batchHeaderActions,
  batchHeaderReject,
  batchPanel,
  floatingBar,
  floatingBarAccept,
  floatingBarLabel,
  floatingBarReject,
  newBlock,
  oldBlock,
  overlayContainer,
  rendererFrame,
} from './diff-review-overlay.css';
import { getSanitizedOperationNode } from './sanitize-operation-node';

const INSERT_GAP = 8;
const DELETE_BG = 'color-mix(in srgb, var(--rc-alert-caution) 7%, transparent)';
const DELETE_BORDER = '2px solid var(--rc-alert-caution)';

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

function getRenderedBlockId(editor: LexicalEditor, node: LexicalNode): string | null {
  return editor.getElementByKey(node.getKey())?.getAttribute('data-block-id') ?? null;
}

function $findBlockByBlockId(editor: LexicalEditor, blockId: string) {
  const root = $getRoot();
  for (const child of root.getChildren()) {
    if (getRenderedBlockId(editor, child) === blockId) {
      return child;
    }
  }
  return null;
}

function preserveBlockState(target: LexicalNode, nextNode: LexicalNode) {
  const currentState = (target.getLatest() as any).__state;
  if (currentState) {
    (nextNode as any).__state = currentState;
  }
}

type OverlayEntry = {
  id: string;
  batchId: string;
  type: 'insert' | 'delete' | 'replace';
  blockEl: HTMLElement | null;
  blockTop: number;
  blockHeight: number;
  previewTop?: number;
  oldNode?: SerializedLexicalNode;
  newNode?: SerializedLexicalNode;
  spacing: 'none' | 'before' | 'after' | 'overlay';
};

function applyDeleteDecorations(entry: OverlayEntry) {
  if (!entry.blockEl) return;
  entry.blockEl.style.background = DELETE_BG;
  entry.blockEl.style.borderLeft = DELETE_BORDER;
  entry.blockEl.style.textDecoration = 'line-through';
  entry.blockEl.style.textDecorationColor = 'var(--rc-alert-caution)';
  entry.blockEl.style.opacity = '0.72';
}

function resetBlockDecorations(entry: OverlayEntry) {
  if (!entry.blockEl) return;
  entry.blockEl.style.background = '';
  entry.blockEl.style.borderLeft = '';
  entry.blockEl.style.textDecoration = '';
  entry.blockEl.style.textDecorationColor = '';
  entry.blockEl.style.opacity = '';
  entry.blockEl.style.visibility = '';
  entry.blockEl.style.marginTop = '';
  entry.blockEl.style.marginBottom = '';
}

function InlineEntryPanel({
  entry,
  batchId,
  extraNodes,
  rendererConfig,
  theme,
  variant,
  onAcceptEntry,
  onRejectEntry,
  previewRefCallback,
}: {
  entry: OverlayEntry;
  batchId: string;
  extraNodes: ReturnType<typeof useExtraNodes>;
  rendererConfig: ReturnType<typeof useRendererConfig>;
  theme: ReturnType<typeof useColorScheme>;
  variant: ReturnType<typeof useVariant>;
  onAcceptEntry: (batchId: string, entryId: string) => void;
  onRejectEntry: (batchId: string, entryId: string) => void;
  previewRefCallback: (id: string) => (el: HTMLDivElement | null) => void;
}): ReactElement {
  return (
    <div
      className={batchPanel}
      ref={previewRefCallback(entry.id)}
      style={{ top: entry.previewTop }}
    >
      <div className={batchHeader}>
        <div className={batchHeaderActions}>
          <button
            className={batchHeaderReject}
            type="button"
            onClick={() => onRejectEntry(batchId, entry.id)}
          >
            Reject
          </button>
          <button
            className={batchHeaderAccept}
            type="button"
            onClick={() => onAcceptEntry(batchId, entry.id)}
          >
            Accept
          </button>
        </div>
      </div>
      {entry.oldNode && (
        <div className={oldBlock}>
          <div className={rendererFrame}>
            <RichRenderer
              extraNodes={extraNodes}
              rendererConfig={rendererConfig}
              theme={theme}
              value={wrapDoc([entry.oldNode])}
              variant={variant}
            />
          </div>
        </div>
      )}
      {entry.newNode && (
        <div className={newBlock}>
          <div className={rendererFrame}>
            <RichRenderer
              extraNodes={extraNodes}
              rendererConfig={rendererConfig}
              theme={theme}
              value={wrapDoc([entry.newNode])}
              variant={variant}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function DiffReviewOverlayPlugin({ store }: { store: AgentStore }): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [overlays, setOverlays] = useState<OverlayEntry[]>([]);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const theme = useColorScheme();
  const variant = useVariant();
  const rendererConfig = useRendererConfig();
  const extraNodes = useExtraNodes();

  const previewRefs = useRef(new Map<string, HTMLDivElement>());
  const observerRef = useRef<ResizeObserver | null>(null);

  const batchGroups = useMemo(() => {
    const groups = new Map<string, OverlayEntry[]>();
    for (const entry of overlays) {
      if (entry.type === 'delete') continue;
      const list = groups.get(entry.batchId) ?? [];
      list.push(entry);
      groups.set(entry.batchId, list);
    }
    return groups;
  }, [overlays]);

  const applyEntryOp = useCallback(
    (op: import('@haklex/rich-agent-core').AgentOperation) => {
      editor.update(() => {
        const root = $getRoot();

        if (op.op === 'insert') {
          const serializedNode = getSanitizedOperationNode(op);
          if (!serializedNode) return;
          const newNode = $parseSerializedNode(serializedNode);
          if (op.position.type === 'root') {
            const idx = op.position.index ?? root.getChildrenSize();
            const children = root.getChildren();
            if (idx >= children.length) root.append(newNode);
            else children[idx].insertBefore(newNode);
          } else {
            const target = $findBlockByBlockId(editor, op.position.blockId);
            if (!target) return;
            if (op.position.type === 'after') target.insertAfter(newNode);
            else target.insertBefore(newNode);
          }
          return;
        }

        if (op.op === 'replace') {
          const serializedNode = getSanitizedOperationNode(op);
          if (!serializedNode) return;
          const target = $findBlockByBlockId(editor, op.blockId);
          if (!target) return;
          const newNode = $parseSerializedNode(serializedNode);
          preserveBlockState(target, newNode);
          target.replace(newNode);
          return;
        }

        if (op.op === 'delete') {
          const target = $findBlockByBlockId(editor, op.blockId);
          if (!target) return;
          target.remove();
        }
      });
    },
    [editor],
  );

  const handleAcceptEntry = useCallback(
    (batchId: string, entryId: string) => {
      const reviewState = store.getState().reviewState;
      const batch = reviewState?.batches.find((item) => item.id === batchId);
      const entry = batch?.entries.find((e) => e.id === entryId);
      if (!entry) return;

      store.getState().acceptReviewEntry(batchId, entryId);
      applyEntryOp(entry.op);
    },
    [store, applyEntryOp],
  );

  const handleRejectEntry = useCallback(
    (batchId: string, entryId: string) => {
      store.getState().rejectReviewEntry(batchId, entryId);
    },
    [store],
  );

  const handleAcceptAllBatch = useCallback(
    (batchId: string) => {
      const reviewState = store.getState().reviewState;
      const batch = reviewState?.batches.find((item) => item.id === batchId);
      if (!batch) return;

      const pendingEntries = batch.entries.filter((e) => e.status === 'pending');
      for (const entry of pendingEntries) {
        store.getState().acceptReviewEntry(batchId, entry.id);
        applyEntryOp(entry.op);
      }
    },
    [store, applyEntryOp],
  );

  const handleRejectAllBatch = useCallback(
    (batchId: string) => {
      store.getState().rejectReviewBatch(batchId);
    },
    [store],
  );

  const repositionPanels = useCallback(() => {
    if (!containerEl) return;
    const containerRect = containerEl.getBoundingClientRect();

    for (const overlay of overlays) {
      if (!overlay.blockEl || overlay.type === 'delete') continue;
      const previewEl = previewRefs.current.get(overlay.id);
      const previewHeight = previewEl?.offsetHeight ?? 0;

      if (overlay.spacing === 'overlay') {
        overlay.blockEl.style.visibility = 'hidden';
        const heightDiff = previewHeight - overlay.blockEl.offsetHeight;
        overlay.blockEl.style.marginBottom = heightDiff > 0 ? `${heightDiff}px` : '';
      } else if (overlay.spacing === 'before') {
        overlay.blockEl.style.marginTop =
          previewHeight > 0 ? `${previewHeight + INSERT_GAP}px` : '';
      } else if (overlay.spacing === 'after') {
        overlay.blockEl.style.marginBottom =
          previewHeight > 0 ? `${previewHeight + INSERT_GAP}px` : '';
      }
    }

    for (const overlay of overlays) {
      if (!overlay.blockEl || overlay.type === 'delete') continue;
      const panelEl = previewRefs.current.get(overlay.id);
      if (!panelEl) continue;

      const blockRect = overlay.blockEl.getBoundingClientRect();
      let newTop: number;
      if (overlay.spacing === 'overlay') {
        newTop = blockRect.top - containerRect.top;
      } else if (overlay.spacing === 'after') {
        newTop = blockRect.bottom - containerRect.top + INSERT_GAP;
      } else {
        newTop = blockRect.top - containerRect.top;
      }
      panelEl.style.top = `${newTop}px`;
    }
  }, [overlays, containerEl]);

  useLayoutEffect(() => {
    repositionPanels();
  }, [repositionPanels]);

  useEffect(() => {
    const observer = new ResizeObserver(() => repositionPanels());
    observerRef.current = observer;
    for (const el of previewRefs.current.values()) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [repositionPanels]);

  const previewRefCallback = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        previewRefs.current.set(id, el);
        observerRef.current?.observe(el);
      } else {
        previewRefs.current.delete(id);
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

    const visibleBatches = reviewState.batches.filter(
      (batch) => batch.status === 'pending' || batch.status === 'order_dependent',
    );
    if (visibleBatches.length === 0) {
      setOverlays([]);
      return;
    }

    const rootEl = editor.getRootElement();
    if (!rootEl) {
      setOverlays([]);
      return;
    }

    const container = rootEl.parentElement ?? rootEl;
    const containerRect = container.getBoundingClientRect();
    const entries: OverlayEntry[] = [];

    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();

      for (const batch of visibleBatches) {
        const baseChildren = (batch.baseSnapshot.root as any).children as SerializedLexicalNode[];
        const blockMap = new Map<string, SerializedLexicalNode>();
        for (const child of baseChildren) {
          const blockId = getBlockId(child);
          if (blockId) blockMap.set(blockId, child);
        }

        for (const entry of batch.entries) {
          if (entry.status !== 'pending') continue;

          if (entry.op.op === 'insert') {
            if (!entry.op.node?.type) continue;

            if (entry.anchorBeforeId) {
              const beforeChild = children.find(
                (child) => getRenderedBlockId(editor, child) === entry.anchorBeforeId,
              );
              if (!beforeChild) continue;
              const domEl = editor.getElementByKey(beforeChild.getKey());
              if (!domEl) continue;
              const rect = domEl.getBoundingClientRect();

              entries.push({
                id: entry.id,
                batchId: batch.id,
                type: 'insert',
                blockEl: domEl,
                blockTop: rect.bottom - containerRect.top,
                blockHeight: rect.height,
                newNode: decorateSubtree(entry.op.node, 'insert'),
                previewTop: rect.bottom - containerRect.top + INSERT_GAP,
                spacing: 'after',
              });
              continue;
            }

            if (entry.anchorAfterId) {
              const afterChild = children.find(
                (child) => getRenderedBlockId(editor, child) === entry.anchorAfterId,
              );
              if (!afterChild) continue;
              const domEl = editor.getElementByKey(afterChild.getKey());
              if (!domEl) continue;
              const rect = domEl.getBoundingClientRect();

              entries.push({
                id: entry.id,
                batchId: batch.id,
                type: 'insert',
                blockEl: domEl,
                blockTop: rect.top - containerRect.top,
                blockHeight: rect.height,
                newNode: decorateSubtree(entry.op.node, 'insert'),
                previewTop: rect.top - containerRect.top,
                spacing: 'before',
              });
            }

            continue;
          }

          const blockId = entry.targetBlockId;
          if (!blockId) continue;

          const child = children.find((item) => getRenderedBlockId(editor, item) === blockId);
          if (!child) continue;
          const domEl = editor.getElementByKey(child.getKey());
          if (!domEl) continue;
          const rect = domEl.getBoundingClientRect();

          if (entry.op.op === 'delete') {
            entries.push({
              id: entry.id,
              batchId: batch.id,
              type: 'delete',
              blockEl: domEl,
              blockTop: rect.top - containerRect.top,
              blockHeight: rect.height,
              spacing: 'none',
            });
            continue;
          }

          const baseNode = blockMap.get(blockId);
          if (!baseNode || !entry.op.node?.type) continue;
          const modified = diffModifiedNode(baseNode, entry.op.node);

          entries.push({
            id: entry.id,
            batchId: batch.id,
            type: 'replace',
            blockEl: domEl,
            blockTop: rect.top - containerRect.top,
            blockHeight: rect.height,
            oldNode: modified.oldNode,
            newNode: modified.newNode,
            previewTop: rect.top - containerRect.top,
            spacing: 'overlay',
          });
        }
      }
    });

    setOverlays(entries);
  }, [editor, store]);

  useEffect(() => {
    for (const overlay of overlays) {
      resetBlockDecorations(overlay);
      if (overlay.type === 'delete') {
        applyDeleteDecorations(overlay);
      }
    }

    return () => {
      for (const overlay of overlays) {
        resetBlockDecorations(overlay);
      }
    };
  }, [overlays]);

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
  }, [computeOverlays, store]);

  useEffect(
    () => editor.registerUpdateListener(() => computeOverlays()),
    [computeOverlays, editor],
  );

  useEffect(() => {
    computeOverlays();
  }, [computeOverlays]);

  const pendingCount = overlays.length;

  if (!containerEl || overlays.length === 0) return null;

  return createPortal(
    <div className={overlayContainer}>
      {Array.from(batchGroups.entries()).map(([batchId, entries]) =>
        entries.map((entry) => {
          if (entry.previewTop == null) return null;
          return (
            <InlineEntryPanel
              batchId={batchId}
              entry={entry}
              extraNodes={extraNodes}
              key={entry.id}
              previewRefCallback={previewRefCallback}
              rendererConfig={rendererConfig}
              theme={theme}
              variant={variant}
              onAcceptEntry={handleAcceptEntry}
              onRejectEntry={handleRejectEntry}
            />
          );
        }),
      )}
      {pendingCount > 1 && (
        <div className={floatingBar}>
          <span className={floatingBarLabel}>{pendingCount} changes</span>
          {Array.from(batchGroups.keys()).map((batchId) => (
            <span key={batchId}>
              <button
                className={floatingBarReject}
                type="button"
                onClick={() => handleRejectAllBatch(batchId)}
              >
                Reject All
              </button>
              <button
                className={floatingBarAccept}
                type="button"
                onClick={() => handleAcceptAllBatch(batchId)}
              >
                Accept All
              </button>
            </span>
          ))}
        </div>
      )}
    </div>,
    containerEl,
  );
}
