import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $addUpdateTag,
  $getRoot,
  $getState,
  $setState,
  createState,
  type EditorState,
  type LexicalNode,
} from 'lexical';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';

export const blockIdState = createState('blockId', {
  parse: (v: unknown) => (typeof v === 'string' ? v : ''),
});

const NORMALIZATION_TAG = 'block-id-normalization';

function buildPreviousIdIndex(editorState: EditorState): Map<string, Set<string>> {
  return editorState.read(() => {
    const map = new Map<string, Set<string>>();
    for (const child of $getRoot().getChildren()) {
      const id = $getState(child, blockIdState);
      if (!id) continue;
      const set = map.get(id) ?? new Set<string>();
      set.add(child.getKey());
      map.set(id, set);
    }
    return map;
  });
}

function collectRootChildren(editorState: EditorState): string[] {
  return editorState.read(() =>
    $getRoot()
      .getChildren()
      .map((child) => $getState(child, blockIdState)),
  );
}

function hasDuplicateOrMissingId(children: string[]) {
  const seen = new Set<string>();
  for (const id of children) {
    if (!id || seen.has(id)) {
      return true;
    }
    seen.add(id);
  }
  return false;
}

function generateBlockId(used: Set<string>) {
  while (true) {
    const id = nanoid(8);
    if (!used.has(id)) {
      return id;
    }
  }
}

function pickKeeperKey(nodes: LexicalNode[], previousKeys?: Set<string>): string | null {
  if (!nodes.length) return null;
  if (previousKeys?.size) {
    for (const node of nodes) {
      if (previousKeys.has(node.getKey())) {
        return node.getKey();
      }
    }
  }
  return nodes[0]?.getKey() ?? null;
}

function normalizeRootBlockIds(
  editor: ReturnType<typeof useLexicalComposerContext>[0],
  previousIdIndex: Map<string, Set<string>>,
) {
  editor.update(
    () => {
      $addUpdateTag('history-merge');
      const children = $getRoot().getChildren();
      const groupedById = new Map<string, LexicalNode[]>();

      for (const child of children) {
        const id = $getState(child, blockIdState);
        if (!id) continue;
        const bucket = groupedById.get(id) ?? [];
        bucket.push(child);
        groupedById.set(id, bucket);
      }

      const keeperById = new Map<string, string>();
      for (const [id, nodes] of groupedById) {
        if (nodes.length <= 1) continue;
        const keeperKey = pickKeeperKey(nodes, previousIdIndex.get(id));
        if (keeperKey) {
          keeperById.set(id, keeperKey);
        }
      }

      const used = new Set<string>();
      for (const child of children) {
        let id = $getState(child, blockIdState);
        const keeperKey = id ? keeperById.get(id) : null;
        const shouldRegenerate =
          !id || used.has(id) || (keeperKey !== undefined && child.getKey() !== keeperKey);

        if (shouldRegenerate) {
          id = generateBlockId(used);
          $setState(child, blockIdState, id);
        }

        used.add(id);
      }
    },
    { tag: NORMALIZATION_TAG },
  );
}

function syncBlockIdAttributes(editor: ReturnType<typeof useLexicalComposerContext>[0]) {
  editor.getEditorState().read(() => {
    for (const child of $getRoot().getChildren()) {
      const id = $getState(child, blockIdState);
      if (!id) continue;
      const dom = editor.getElementByKey(child.getKey());
      if (dom && dom.getAttribute('data-block-id') !== id) {
        dom.setAttribute('data-block-id', id);
      }
    }
  });
}

export function BlockIdPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Normalize once on mount so legacy documents get stable block IDs immediately.
    const initialChildren = collectRootChildren(editor.getEditorState());
    if (hasDuplicateOrMissingId(initialChildren)) {
      normalizeRootBlockIds(editor, new Map());
    }
    syncBlockIdAttributes(editor);

    return editor.registerUpdateListener(({ tags, editorState, prevEditorState }) => {
      if (tags.has(NORMALIZATION_TAG)) {
        syncBlockIdAttributes(editor);
        return;
      }

      const children = collectRootChildren(editorState);
      if (!hasDuplicateOrMissingId(children)) {
        syncBlockIdAttributes(editor);
        return;
      }

      const previousIdIndex = buildPreviousIdIndex(prevEditorState);
      normalizeRootBlockIds(editor, previousIdIndex);
    });
  }, [editor]);

  return null;
}
