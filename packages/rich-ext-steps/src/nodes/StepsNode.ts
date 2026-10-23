import '../augment';

import { createRendererDecoration } from '@haklex/rich-editor/renderers';
import { extractTextContent } from '@haklex/rich-editor/static';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import { DecoratorNode } from 'lexical';
import type { ReactElement } from 'react';

import { STEPS_NODE_KEY } from '../slot';
import { StepsRenderer } from '../StepsRenderer';
import type { SerializedStepsNode, StepItem } from '../types';
import { createStep, normalizeSteps } from '../utils';

export type { SerializedStepsNode } from '../types';

export class StepsNode extends DecoratorNode<ReactElement> {
  __steps: StepItem[];

  static getType(): string {
    return 'steps';
  }

  static clone(node: StepsNode): StepsNode {
    return new StepsNode(node.__steps, node.__key);
  }

  constructor(steps?: StepItem[], key?: NodeKey) {
    super(key);
    this.__steps = steps ?? [createStep()];
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'rich-steps-block';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getSteps(): StepItem[] {
    return this.getLatest().__steps;
  }

  setSteps(steps: StepItem[]): void {
    const writable = this.getWritable();
    writable.__steps = steps;
  }

  getTextContent(): string {
    return this.__steps
      .map((step) => [step.title, extractTextContent(step.content)].filter(Boolean).join('\n'))
      .join('\n');
  }

  static importJSON(_serializedNode: SerializedLexicalNode & Record<string, unknown>): StepsNode {
    const serializedNode = _serializedNode as unknown as SerializedStepsNode;
    return new StepsNode(normalizeSteps(serializedNode.steps)).updateFromJSON(_serializedNode);
  }

  exportJSON(): SerializedStepsNode {
    return {
      ...super.exportJSON(),
      type: 'steps',
      steps: this.__steps,
      version: 1,
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createRendererDecoration(STEPS_NODE_KEY, StepsRenderer, {
      steps: this.__steps,
    });
  }
}

export function $createStepsNode(steps?: StepItem[]): StepsNode {
  return new StepsNode(steps);
}

export function $isStepsNode(node: LexicalNode | null | undefined): node is StepsNode {
  return node instanceof StepsNode;
}
