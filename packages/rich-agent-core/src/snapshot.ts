import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

export type EditorSnapshot = {
  raw: SerializedEditorState;
  blockIds: string[];
  getBlock: (blockId: string) => SerializedLexicalNode | undefined;
};

export function createSnapshot(editorState: SerializedEditorState): EditorSnapshot {
  const root = editorState.root as SerializedLexicalNode & { children?: SerializedLexicalNode[] };
  const children = root.children ?? [];

  const blockMap = new Map<string, SerializedLexicalNode>();
  const blockIds: string[] = [];

  for (const child of children) {
    const blockId = (child as any).$?.blockId as string | undefined;
    if (blockId) {
      blockMap.set(blockId, child);
      blockIds.push(blockId);
    }
  }

  return {
    raw: editorState,
    blockIds,
    getBlock: (blockId: string) => blockMap.get(blockId),
  };
}

export function compareBlockContent(a: SerializedLexicalNode, b: SerializedLexicalNode): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
