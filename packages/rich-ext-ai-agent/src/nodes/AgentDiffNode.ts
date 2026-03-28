import type { EditorConfig, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { AgentDiffRenderer } from '../renderers/AgentDiffRenderer';

export type SerializedAgentDiffNode = Spread<
  { diffEntryId: string; opType: 'insert' | 'replace' | 'delete' },
  SerializedLexicalNode
>;

export class AgentDiffNode extends DecoratorNode<ReactElement> {
  __diffEntryId: string;
  __opType: 'insert' | 'replace' | 'delete';

  static getType(): string {
    return 'agent-diff';
  }

  static clone(node: AgentDiffNode): AgentDiffNode {
    return new AgentDiffNode(node.__diffEntryId, node.__opType, node.__key);
  }

  constructor(diffEntryId: string, opType: 'insert' | 'replace' | 'delete', key?: NodeKey) {
    super(key);
    this.__diffEntryId = diffEntryId;
    this.__opType = opType;
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
    return new AgentDiffNode(json.diffEntryId, json.opType);
  }

  exportJSON(): SerializedAgentDiffNode {
    return {
      ...super.exportJSON(),
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
      type: 'agent-diff',
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AgentDiffRenderer, {
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
    });
  }
}

export function $createAgentDiffNode(
  diffEntryId: string,
  opType: 'insert' | 'replace' | 'delete',
): AgentDiffNode {
  return new AgentDiffNode(diffEntryId, opType);
}

export function $isAgentDiffNode(node: unknown): node is AgentDiffNode {
  return node instanceof AgentDiffNode;
}
