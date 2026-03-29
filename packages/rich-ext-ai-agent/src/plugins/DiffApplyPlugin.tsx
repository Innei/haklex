import type { AgentStore } from '@haklex/rich-agent-core';
import { blockIdState } from '@haklex/rich-editor/plugins';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getState, $parseSerializedNode, type LexicalNode } from 'lexical';
import { useEffect } from 'react';

function $findBlockByBlockId(blockId: string): LexicalNode | null {
  const root = $getRoot();
  for (const child of root.getChildren()) {
    if ($getState(child, blockIdState) === blockId) {
      return child;
    }
  }
  return null;
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
          } else if (op.op === 'replace') {
            if (!op.node?.type) continue;
            const target = $findBlockByBlockId(op.blockId);
            if (!target) continue;
            const newNode = $parseSerializedNode(op.node);
            target.replace(newNode);
          } else if (op.op === 'delete') {
            const target = $findBlockByBlockId(op.blockId);
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
