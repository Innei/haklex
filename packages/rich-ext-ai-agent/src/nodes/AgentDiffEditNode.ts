import type { EditorConfig, LexicalEditor } from 'lexical';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { AgentDiffEditRenderer } from '../renderers/AgentDiffEditRenderer';
import { AgentDiffNode, type SerializedAgentDiffNode } from './AgentDiffNode';

export class AgentDiffEditNode extends AgentDiffNode {
  static getType(): string {
    return 'agent-diff';
  }

  static clone(node: AgentDiffEditNode): AgentDiffEditNode {
    return new AgentDiffEditNode(node.__diffEntryId, node.__opType, node.__key);
  }

  static importJSON(json: SerializedAgentDiffNode): AgentDiffEditNode {
    return new AgentDiffEditNode(json.diffEntryId, json.opType);
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(AgentDiffEditRenderer, {
      nodeKey: this.__key,
      diffEntryId: this.__diffEntryId,
      opType: this.__opType,
    });
  }
}

export function $createAgentDiffEditNode(
  diffEntryId: string,
  opType: 'insert' | 'replace' | 'delete',
): AgentDiffEditNode {
  return new AgentDiffEditNode(diffEntryId, opType);
}
