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
  diffContainer,
  floatingBar,
  floatingBarAccept,
  floatingBarLabel,
  floatingBarReject,
  newBlock,
  oldBlock,
  rendererFrame,
} from './diff-review-overlay.css';
import { getSanitizedOperationNode } from './sanitize-operation-node';

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
  oldNode?: SerializedLexicalNode;
  newNode?: SerializedLexicalNode;
  spacing: 'none' | 'before' | 'after';
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
}: {
  entry: OverlayEntry;
  batchId: string;
  extraNodes: ReturnType<typeof useExtraNodes>;
  rendererConfig: ReturnType<typeof useRendererConfig>;
  theme: ReturnType<typeof useColorScheme>;
  variant: ReturnType<typeof useVariant>;
  onAcceptEntry: (batchId: string, entryId: string) => void;
  onRejectEntry: (batchId: string, entryId: string) => void;
}): ReactElement {
  return (
    <div className={batchPanel}>
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
      <>
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
      </>
    </div>
  );
}

export function DiffReviewOverlayPlugin({ store }: { store: AgentStore }): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  const [overlays, setOverlays] = useState<OverlayEntry[]>([]);
  const theme = useColorScheme();
  const variant = useVariant();
  const rendererConfig = useRendererConfig();
  const extraNodes = useExtraNodes();

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
    if (!rootEl) return;

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

              entries.push({
                id: entry.id,
                batchId: batch.id,
                type: 'insert',
                blockEl: domEl,
                newNode: decorateSubtree(entry.op.node, 'insert'),
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

              entries.push({
                id: entry.id,
                batchId: batch.id,
                type: 'insert',
                blockEl: domEl,
                newNode: decorateSubtree(entry.op.node, 'insert'),
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

          if (entry.op.op === 'delete') {
            entries.push({
              id: entry.id,
              batchId: batch.id,
              type: 'delete',
              blockEl: domEl,
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
            oldNode: modified.oldNode,
            newNode: modified.newNode,
            spacing: 'none',
          });
        }
      }
    });

    setOverlays(entries);
  }, [editor, store]);

  const containerRefs = useRef(new Map<string, HTMLDivElement>());

  useLayoutEffect(() => {
    const prevContainers = containerRefs.current;
    const nextContainers = new Map<string, HTMLDivElement>();

    for (const [, container] of prevContainers) {
      const hiddenBlockId = container.dataset.diffBlockId;
      if (hiddenBlockId) {
        const rootEl = editor.getRootElement();
        const blockEl = rootEl?.querySelector(
          `[data-block-id="${hiddenBlockId}"]`,
        ) as HTMLElement | null;
        if (blockEl) blockEl.style.display = '';
      }
      container.remove();
    }

    for (const entry of overlays) {
      if (entry.type === 'delete' || !entry.blockEl) continue;

      const container = document.createElement('div');
      container.setAttribute('contenteditable', 'false');
      container.className = diffContainer;
      container.dataset.diffEntryId = entry.id;

      if (entry.type === 'replace') {
        const blockId = entry.blockEl.getAttribute('data-block-id');
        if (blockId) container.dataset.diffBlockId = blockId;
        entry.blockEl.parentNode?.insertBefore(container, entry.blockEl);
        entry.blockEl.style.display = 'none';
      } else if (entry.spacing === 'after') {
        entry.blockEl.parentNode?.insertBefore(container, entry.blockEl.nextSibling);
      } else {
        entry.blockEl.parentNode?.insertBefore(container, entry.blockEl);
      }

      nextContainers.set(entry.id, container);
    }

    containerRefs.current = nextContainers;

    return () => {
      for (const [, container] of nextContainers) {
        const hiddenBlockId = container.dataset.diffBlockId;
        if (hiddenBlockId) {
          const rootEl = editor.getRootElement();
          const blockEl = rootEl?.querySelector(
            `[data-block-id="${hiddenBlockId}"]`,
          ) as HTMLElement | null;
          if (blockEl) blockEl.style.display = '';
        }
        container.remove();
      }
      containerRefs.current = new Map();
    };
  }, [overlays, editor]);

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

  const portals: ReactElement[] = [];

  for (const entry of overlays) {
    if (entry.type === 'delete') continue;
    const container = containerRefs.current.get(entry.id);
    if (!container) continue;

    portals.push(
      createPortal(
        <InlineEntryPanel
          batchId={entry.batchId}
          entry={entry}
          extraNodes={extraNodes}
          key={entry.id}
          rendererConfig={rendererConfig}
          theme={theme}
          variant={variant}
          onAcceptEntry={handleAcceptEntry}
          onRejectEntry={handleRejectEntry}
        />,
        container,
      ),
    );
  }

  if (pendingCount > 1) {
    portals.push(
      createPortal(
        <div className={floatingBar} key="__floating-bar__">
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
        </div>,
        document.body,
      ),
    );
  }

  if (portals.length === 0) return null;

  return <>{portals}</>;
}
