import type { AgentStore } from '@haklex/rich-agent-core';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $parseSerializedNode, type LexicalEditor, type LexicalNode } from 'lexical';
import { useEffect } from 'react';

import { getSanitizedOperationNode } from './sanitize-operation-node';

function getRenderedBlockId(editor: LexicalEditor, node: LexicalNode): string | null {
  return editor.getElementByKey(node.getKey())?.getAttribute('data-block-id') ?? null;
}

function $findBlockByBlockId(editor: LexicalEditor, blockId: string): LexicalNode | null {
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

export function DiffApplyPlugin({ store }: { store: AgentStore }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let prevDiffState = store.getState().diffState;

    return store.subscribe((state) => {
      const diffState = state.diffState;
      if (diffState === prevDiffState) return;
      prevDiffState = diffState;

      if (!diffState) return;
      const pending = diffState.getPending();
      if (pending.length === 0) return;

      editor.update(() => {
        const root = $getRoot();

        for (const entry of pending) {
          const { op } = entry;

          if (op.op === 'insert') {
            const serializedNode = getSanitizedOperationNode(op);
            if (!serializedNode) continue;
            const newNode = $parseSerializedNode(serializedNode);

            if (op.position.type === 'root') {
              const idx = op.position.index ?? root.getChildrenSize();
              const children = root.getChildren();
              if (idx >= children.length) {
                root.append(newNode);
              } else {
                children[idx].insertBefore(newNode);
              }
            } else {
              const target = $findBlockByBlockId(editor, op.position.blockId);
              if (!target) continue;
              if (op.position.type === 'after') {
                target.insertAfter(newNode);
              } else {
                target.insertBefore(newNode);
              }
            }
          } else if (op.op === 'replace') {
            const serializedNode = getSanitizedOperationNode(op);
            if (!serializedNode) continue;
            const target = $findBlockByBlockId(editor, op.blockId);
            if (!target) continue;
            const newNode = $parseSerializedNode(serializedNode);
            preserveBlockState(target, newNode);
            target.replace(newNode);
          } else if (op.op === 'delete') {
            const target = $findBlockByBlockId(editor, op.blockId);
            if (!target) continue;
            target.remove();
          }

          entry.status = 'accepted';
        }
      });
    });
  }, [editor, store]);

  return null;
}
