import type { SerializedLexicalNode } from 'lexical';

export type NodePosition =
  | { type: 'after'; blockId: string }
  | { type: 'before'; blockId: string }
  | { type: 'root'; index?: number };

export type AgentOperation =
  | { op: 'insert'; position: NodePosition; node: SerializedLexicalNode }
  | { op: 'replace'; blockId: string; node: SerializedLexicalNode }
  | { op: 'delete'; blockId: string };

export type SelectionSnapshot = {
  text: string;
  anchorBlockId: string;
  anchorOffset: number;
  focusBlockId: string;
  focusOffset: number;
};

export type AgentContext = {
  selection: SelectionSnapshot | null;
  getBlockByBlockId: (blockId: string) => SerializedLexicalNode | null;
  getDocumentStructure: () => SerializedLexicalNode;
};

export type DiffEntry = {
  id: string;
  op: AgentOperation;
  status: 'pending' | 'accepted' | 'rejected';
  originalNode?: SerializedLexicalNode;
};

export type DiffState = {
  entries: DiffEntry[];
  getByBlockId: (blockId: string) => DiffEntry | undefined;
  getPending: () => DiffEntry[];
};
