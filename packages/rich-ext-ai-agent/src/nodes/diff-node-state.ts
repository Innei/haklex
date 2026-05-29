import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

export type AgentDiffOpType = 'insert' | 'replace' | 'delete';

export type AgentDiffNodePayload = {
  batchId: string;
  diffEntryId: string;
  opType: AgentDiffOpType;
  originalNode?: SerializedLexicalNode | null;
  proposedNode?: SerializedLexicalNode | null;
};

type SerializedNodeWithChildren = SerializedLexicalNode & {
  children?: SerializedLexicalNode[];
};

function cloneNode<T>(node: T): T {
  return structuredClone(node);
}

function projectNodeToFactualSide(node: SerializedLexicalNode): SerializedLexicalNode[] {
  const diffNode = node as SerializedLexicalNode & AgentDiffNodePayload;

  if (diffNode.type === 'agent-diff') {
    if (diffNode.opType === 'insert') {
      return [];
    }

    return diffNode.originalNode ? [cloneNode(diffNode.originalNode)] : [];
  }

  const nodeWithChildren = node as SerializedNodeWithChildren;
  if (!Array.isArray(nodeWithChildren.children)) {
    return [cloneNode(node)];
  }

  return [
    {
      ...cloneNode(node),
      children: nodeWithChildren.children.flatMap(projectNodeToFactualSide),
    } as SerializedLexicalNode,
  ];
}

export function projectAgentDiffNodesToFactualState(
  editorState: SerializedEditorState,
): SerializedEditorState {
  const root = editorState.root as SerializedNodeWithChildren;
  const children = Array.isArray(root.children) ? root.children : [];

  return {
    ...editorState,
    root: {
      ...root,
      children: children.flatMap(projectNodeToFactualSide),
    } as SerializedEditorState['root'],
  };
}
