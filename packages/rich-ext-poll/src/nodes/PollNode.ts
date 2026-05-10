import '../augment';

import { createRendererDecoration } from '@haklex/rich-editor/renderers';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import { customAlphabet } from 'nanoid';
import type { ReactElement } from 'react';

import { POLL_NODE_KEY } from '../slot';
import type { PollMode, PollOption, PollShowResults } from '../types';

const idAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
const makePollIdSuffix = customAlphabet(idAlphabet, 10);
const makeOptionIdSuffix = customAlphabet(idAlphabet, 6);

export function createPollId(): string {
  return `p_${makePollIdSuffix()}`;
}

export function createOptionId(): string {
  return `o_${makeOptionIdSuffix()}`;
}

export interface PollNodePayload {
  closeAt?: string;
  mode?: PollMode;
  options?: PollOption[];
  pollId?: string;
  question?: string;
  showResults?: PollShowResults;
}

export type SerializedPollNode = Spread<
  {
    pollId: string;
    question: string;
    options: PollOption[];
    mode: PollMode;
    closeAt?: string;
    showResults?: PollShowResults;
  },
  SerializedLexicalNode
>;

export class PollNode extends DecoratorNode<ReactElement> {
  __pollId: string;
  __question: string;
  __options: PollOption[];
  __mode: PollMode;
  __closeAt?: string;
  __showResults?: PollShowResults;

  static getType(): string {
    return 'poll';
  }

  static clone(node: PollNode): PollNode {
    return new PollNode(
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

  constructor(payload: PollNodePayload = {}, key?: NodeKey) {
    super(key);
    this.__pollId = payload.pollId ?? createPollId();
    this.__question = payload.question ?? '';
    this.__options =
      payload.options && payload.options.length > 0
        ? payload.options
        : [
            { id: createOptionId(), label: '' },
            { id: createOptionId(), label: '' },
          ];
    this.__mode = payload.mode ?? 'single';
    this.__closeAt = payload.closeAt;
    this.__showResults = payload.showResults;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-poll-wrapper';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getPollId(): string {
    return this.getLatest().__pollId;
  }

  getQuestion(): string {
    return this.getLatest().__question;
  }

  setQuestion(question: string): void {
    const writable = this.getWritable();
    writable.__question = question;
  }

  getOptions(): PollOption[] {
    return this.getLatest().__options;
  }

  setOptions(options: PollOption[]): void {
    const writable = this.getWritable();
    writable.__options = options;
  }

  getMode(): PollMode {
    return this.getLatest().__mode;
  }

  setMode(mode: PollMode): void {
    const writable = this.getWritable();
    writable.__mode = mode;
  }

  getCloseAt(): string | undefined {
    return this.getLatest().__closeAt;
  }

  setCloseAt(closeAt: string | undefined): void {
    const writable = this.getWritable();
    writable.__closeAt = closeAt;
  }

  getShowResults(): PollShowResults | undefined {
    return this.getLatest().__showResults;
  }

  setShowResults(showResults: PollShowResults | undefined): void {
    const writable = this.getWritable();
    writable.__showResults = showResults;
  }

  static importJSON(serializedNode: SerializedPollNode): PollNode {
    return new PollNode({
      pollId: serializedNode.pollId,
      question: serializedNode.question,
      options: serializedNode.options,
      mode: serializedNode.mode,
      closeAt: serializedNode.closeAt,
      showResults: serializedNode.showResults,
    });
  }

  exportJSON(): SerializedPollNode {
    return {
      ...super.exportJSON(),
      type: 'poll',
      pollId: this.__pollId,
      question: this.__question,
      options: this.__options,
      mode: this.__mode,
      ...(this.__closeAt ? { closeAt: this.__closeAt } : {}),
      ...(this.__showResults ? { showResults: this.__showResults } : {}),
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(POLL_NODE_KEY, undefined, {
      pollId: this.__pollId,
      question: this.__question,
      options: this.__options,
      mode: this.__mode,
      closeAt: this.__closeAt,
      showResults: this.__showResults,
    });
  }
}

export function $createPollNode(payload?: PollNodePayload): PollNode {
  return new PollNode(payload);
}

export function $isPollNode(node: LexicalNode | null | undefined): node is PollNode {
  return node instanceof PollNode;
}
