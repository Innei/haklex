import type { EditorConfig, LexicalEditor } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { AgentDiffEditRenderer } from '../renderers/AgentDiffEditRenderer';
import { AgentDiffNode, type SerializedAgentDiffNode } from './AgentDiffNode';
import type { AgentDiffNodePayload } from './diff-node-state';

export class AgentDiffEditNode extends AgentDiffNode {
  static getType(): string {
    return 'agent-diff';
  }

  static clone(node: AgentDiffEditNode): AgentDiffEditNode {
    return new AgentDiffEditNode(node.getPayload(), node.__key);
  }

  static importJSON(json: SerializedAgentDiffNode): AgentDiffEditNode {
    return new AgentDiffEditNode({
      batchId: json.batchId ?? '',
      diffEntryId: json.diffEntryId,
      opType: json.opType,
      originalNode: json.originalNode ?? null,
      proposedNode: json.proposedNode ?? null,
    });
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AgentDiffEditRenderer, {
      batchId: this.__batchId,
      nodeKey: this.__key,
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
      originalNode: this.__originalNode,
      proposedNode: this.__proposedNode,
    });
  }
}

export function $createAgentDiffEditNode(payload: AgentDiffNodePayload): AgentDiffEditNode {
  return new AgentDiffEditNode(payload);
}
