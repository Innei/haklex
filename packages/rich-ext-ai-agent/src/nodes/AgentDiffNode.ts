import type { EditorConfig, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { AgentDiffRenderer } from '../renderers/AgentDiffRenderer';
import type { AgentDiffNodePayload, AgentDiffOpType } from './diff-node-state';

export type SerializedAgentDiffNode = Spread<AgentDiffNodePayload, SerializedLexicalNode>;

export class AgentDiffNode extends DecoratorNode<ReactElement> {
  __batchId: string;
  __diffEntryId: string;
  __opType: AgentDiffOpType;
  __originalNode: SerializedLexicalNode | null;
  __proposedNode: SerializedLexicalNode | null;

  static getType(): string {
    return 'agent-diff';
  }

  static clone(node: AgentDiffNode): AgentDiffNode {
    return new AgentDiffNode(node.getPayload(), node.__key);
  }

  constructor(payload: AgentDiffNodePayload, key?: NodeKey) {
    super(key);
    this.__batchId = payload.batchId;
    this.__diffEntryId = payload.diffEntryId;
    this.__opType = payload.opType;
    this.__originalNode = payload.originalNode ?? null;
    this.__proposedNode = payload.proposedNode ?? null;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.setAttribute('data-agent-diff', this.__opType);
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  static importJSON(json: SerializedAgentDiffNode): AgentDiffNode {
    return new AgentDiffNode({
      batchId: json.batchId ?? '',
      diffEntryId: json.diffEntryId,
      opType: json.opType,
      originalNode: json.originalNode ?? null,
      proposedNode: json.proposedNode ?? null,
    });
  }

  getPayload(): AgentDiffNodePayload {
    return {
      batchId: this.__batchId,
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
      originalNode: this.__originalNode,
      proposedNode: this.__proposedNode,
    };
  }

  getBatchId(): string {
    return this.__batchId;
  }

  getDiffEntryId(): string {
    return this.__diffEntryId;
  }

  getOpType(): AgentDiffOpType {
    return this.__opType;
  }

  exportJSON(): SerializedAgentDiffNode {
    return {
      ...super.exportJSON(),
      batchId: this.__batchId,
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
      originalNode: this.__originalNode,
      proposedNode: this.__proposedNode,
      type: 'agent-diff',
      version: 2,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AgentDiffRenderer, {
      batchId: this.__batchId,
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
      originalNode: this.__originalNode,
      proposedNode: this.__proposedNode,
    });
  }
}

export function $createAgentDiffNode(payload: AgentDiffNodePayload): AgentDiffNode {
  return new AgentDiffNode(payload);
}

export function $isAgentDiffNode(node: unknown): node is AgentDiffNode {
  return node instanceof AgentDiffNode;
}
