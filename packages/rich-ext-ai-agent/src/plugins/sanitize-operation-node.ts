import type { AgentOperation } from '@haklex/rich-agent-core';
import type { SerializedLexicalNode } from 'lexical';

export function stripBlockIdFromSerializedNode<
  T extends { $?: Record<string, unknown>; children?: unknown[] },
>(node: T): T {
  if (!node || typeof node !== 'object') return node;

  const next = { ...node } as T & {
    $?: Record<string, unknown>;
    children?: unknown[];
  };

  if (next.$ && typeof next.$ === 'object') {
    const rest = { ...next.$ };
    delete rest.blockId;
    if (Object.keys(rest).length === 0) delete next.$;
    else next.$ = rest;
  }

  if (Array.isArray(next.children)) {
    next.children = next.children.map((child) => stripBlockIdFromSerializedNode(child as T));
  }

  return next;
}

export function getSanitizedOperationNode(op: AgentOperation): SerializedLexicalNode | null {
  if (op.op === 'delete') return null;
  if (!op.node?.type) return null;

  return stripBlockIdFromSerializedNode(op.node as SerializedLexicalNode);
}
