import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import type { EditorConfig, LexicalEditor, NodeKey } from 'lexical';
import { $insertNodes } from 'lexical';
import { Vote } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { PollEditDecorator } from '../PollEditDecorator';
import { PollNode, type PollNodePayload, type SerializedPollNode } from './PollNode';

export class PollEditNode extends PollNode {
  static commandItems: CommandItemConfig[] = [
    {
      title: 'Poll',
      icon: createElement(Vote, { size: 20 }),
      description: 'Reader-facing vote widget',
      keywords: ['poll', 'vote', 'survey', 'choice'],
      section: 'ADVANCED',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createPollEditNode()]);
        });
      },
    },
  ];

  static getType(): string {
    return 'poll';
  }

  static clone(node: PollEditNode): PollEditNode {
    return new PollEditNode(
      {
        pollId: node.__pollId,
        question: node.__question,
        options: node.__options,
        mode: node.__mode,
        closeAt: node.__closeAt,
        showResults: node.__showResults,
      },
      node.__key,
    );
  }

  constructor(payload?: PollNodePayload, key?: NodeKey) {
    super(payload, key);
  }

  static importJSON(serializedNode: SerializedPollNode): PollEditNode {
    return new PollEditNode({
      pollId: serializedNode.pollId,
      question: serializedNode.question,
      options: serializedNode.options,
      mode: serializedNode.mode,
      closeAt: serializedNode.closeAt,
      showResults: serializedNode.showResults,
    });
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(PollEditDecorator, {
      nodeKey: this.__key,
      pollId: this.__pollId,
      question: this.__question,
      options: this.__options,
      mode: this.__mode,
      closeAt: this.__closeAt,
      showResults: this.__showResults,
    });
  }
}

export function $createPollEditNode(payload?: PollNodePayload): PollEditNode {
  return new PollEditNode(payload);
}
