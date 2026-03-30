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
import { $getRoot, $getState, $parseSerializedNode, type SerializedLexicalNode } from 'lexical';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  overlayContainer,
} from './diff-review-overlay.css';

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

function $findBlockByBlockId(blockId: string) {
  const root = $getRoot();
  for (const child of root.getChildren()) {
    if ($getState(child, blockIdState) === blockId) {
      return child;
    }
  }
  return null;
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
  entry.blockEl.style.marginTop = '';
  entry.blockEl.style.marginBottom = '';
}

function InlineToolbar({
  batchId,
  top,
  onAccept,
  onReject,
}: {
  batchId: string;
  onAccept: (batchId: string) => void;
  onReject: (batchId: string) => void;
  top: number;
}): ReactElement {
  return (
    <div className={inlineToolbarLayer} style={{ top }}>
      <div className={inlineToolbar}>
        <ActionButton
          icon
          rounded
          aria-label="Reject change"
          className={`${inlineActionButton} ${inlineRejectButton}`}
          size="sm"
          title="Reject change"
          onClick={() => onReject(batchId)}
        >
          <X size={14} />
        </ActionButton>
        <ActionButton
          icon
          rounded
          aria-label="Accept change"
          className={`${inlineActionButton} ${inlineAcceptButton}`}
          size="sm"
          title="Accept change"
          onClick={() => onAccept(batchId)}
        >
          <Check size={14} />
        </ActionButton>
      </div>
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

  const renderNode = useCallback(
    (node: SerializedLexicalNode) => (
      <RichRenderer
        extraNodes={extraNodes}
        rendererConfig={rendererConfig}
        theme={theme}
        value={wrapDoc([node])}
        variant={variant}
      />
    ),
    [extraNodes, rendererConfig, theme, variant],
  );

  const handleAcceptBatch = useCallback(
    (batchId: string) => {
      const reviewState = store.getState().reviewState;
      const batch = reviewState?.batches.find((item) => item.id === batchId);
      if (!batch) return;

      store.getState().acceptReviewBatch(batchId);

      editor.update(() => {
        const root = $getRoot();

        for (const entry of batch.entries) {
          const { op } = entry;

          if (op.op === 'insert') {
            if (!op.node?.type) continue;
            const newNode = $parseSerializedNode(op.node);
            if (op.position.type === 'root') {
              const idx = op.position.index ?? root.getChildrenSize();
              const children = root.getChildren();
              if (idx >= children.length) {
                root.append(newNode);
              } else {
                children[idx].insertBefore(newNode);
              }
            } else {
              const target = $findBlockByBlockId(op.position.blockId);
              if (!target) continue;
              if (op.position.type === 'after') {
                target.insertAfter(newNode);
              } else {
                target.insertBefore(newNode);
              }
            }
            continue;
          }

          if (op.op === 'replace') {
            if (!op.node?.type) continue;
            const target = $findBlockByBlockId(op.blockId);
            if (!target) continue;
            target.replace($parseSerializedNode(op.node));
            continue;
          }

          if (op.op === 'delete') {
            const target = $findBlockByBlockId(op.blockId);
            if (!target) continue;
            target.remove();
          }
        }
      });
    },
    [editor, store],
  );

  const handleRejectBatch = useCallback(
    (batchId: string) => {
      store.getState().rejectReviewBatch(batchId);
    },
    [store],
  );

  const syncSpacing = useCallback(() => {
    for (const overlay of overlays) {
      if (!overlay.blockEl) continue;
      const previewEl = previewRefs.current.get(overlay.id);
      const previewHeight = previewEl?.offsetHeight ?? 0;

      if (overlay.spacing === 'before') {
        overlay.blockEl.style.marginTop =
          previewHeight > 0 ? `${previewHeight + INSERT_GAP}px` : '';
      } else if (overlay.spacing === 'after') {
        overlay.blockEl.style.marginBottom =
          previewHeight > 0 ? `${previewHeight + INSERT_GAP}px` : '';
      }
    }
  }, [overlays]);

  useEffect(() => {
    const observer = new ResizeObserver(() => syncSpacing());
    observerRef.current = observer;
    for (const el of previewRefs.current.values()) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [syncSpacing]);

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

    const pendingBatches = reviewState.batches.filter((batch) => batch.status === 'pending');
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
        for (const child of baseChildren) {
          const blockId = getBlockId(child);
          if (blockId) blockMap.set(blockId, child);
        }

        for (const entry of batch.entries) {
          if (entry.op.op === 'insert') {
            if (!entry.op.node?.type) continue;

            if (entry.anchorBeforeId) {
              const beforeChild = children.find(
                (child) => $getState(child, blockIdState) === entry.anchorBeforeId,
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
                (child) => $getState(child, blockIdState) === entry.anchorAfterId,
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

          const child = children.find((item) => $getState(item, blockIdState) === blockId);
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
          const diffResult = diffModifiedNode(baseNode, entry.op.node);

          entries.push({
            id: entry.id,
            batchId: batch.id,
            type: 'replace',
            blockEl: domEl,
            blockTop: rect.top - containerRect.top,
            blockHeight: rect.height,
            oldNode: diffResult.oldNode,
            newNode: diffResult.newNode,
            previewTop: rect.bottom - containerRect.top + INSERT_GAP,
            spacing: 'after',
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

    syncSpacing();

    return () => {
      for (const overlay of overlays) {
        resetBlockDecorations(overlay);
      }
    };
  }, [overlays, syncSpacing]);

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

  if (!containerEl || overlays.length === 0) return null;

  return createPortal(
    <div className={overlayContainer}>
      {overlays.map((overlay) => (
        <InlineToolbar
          batchId={overlay.batchId}
          key={`${overlay.id}:toolbar`}
          top={overlay.blockTop + TOOLBAR_OFFSET}
          onAccept={handleAcceptBatch}
          onReject={handleRejectBatch}
        />
      ))}

      {overlays.map((overlay) => {
        if (!overlay.previewNode || overlay.previewTop == null) return null;

        const tone = overlay.type === 'replace' ? 'replace' : 'insert';
        return (
          <div
            className={`${inlinePreview} ${inlinePreviewTone[tone]}`}
            key={`${overlay.id}:preview`}
            ref={previewRefCallback(overlay.id)}
            style={{ top: overlay.previewTop }}
          >
            <div className={inlinePreviewBody}>
              <div className={inlineRendererFrame}>{renderNode(overlay.previewNode)}</div>
            </div>
          </div>
        );
      })}
    </div>,
    containerEl,
  );
}
