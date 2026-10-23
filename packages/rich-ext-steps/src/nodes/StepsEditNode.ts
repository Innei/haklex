import { createNestedEditor } from '@haklex/rich-editor';
import type { CommandItemConfig } from '@haklex/rich-editor/commands';
import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import { $insertNodes } from 'lexical';
import { ListOrdered } from 'lucide-react';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { StepsEditDecorator } from '../StepsEditDecorator';
import type { SerializedStepsNode, StepItem } from '../types';
import { createStep, normalizeSteps } from '../utils';
import { StepsNode } from './StepsNode';

function createStepEditor(step: StepItem): LexicalEditor {
  const editor = createNestedEditor('StepContent');
  editor.setEditorState(editor.parseEditorState(step.content));
  return editor;
}

export class StepsEditNode extends StepsNode {
  __stepEditors: LexicalEditor[];

  static commandItems: CommandItemConfig[] = [
    {
      title: 'Steps',
      icon: createElement(ListOrdered, { size: 20 }),
      description: 'Numbered steps with a title and content each',
      keywords: ['steps', 'step', 'tutorial', 'guide', 'howto'],
      nested: false,
      section: 'LAYOUT',
      placement: ['slash', 'toolbar'],
      group: 'insert',
      onSelect: (editor) => {
        editor.update(() => {
          $insertNodes([$createStepsEditNode()]);
        });
      },
    },
  ];

  static clone(node: StepsEditNode): StepsEditNode {
    return new StepsEditNode(node.__steps, node.__key, node.__stepEditors);
  }

  constructor(steps?: StepItem[], key?: NodeKey, stepEditors?: LexicalEditor[]) {
    super(steps?.length ? steps : undefined, key);
    this.__stepEditors = stepEditors ?? this.__steps.map(createStepEditor);
  }

  getStepEditors(): LexicalEditor[] {
    return this.getLatest().__stepEditors;
  }

  setSteps(steps: StepItem[]): void {
    const writable = this.getWritable();
    const next = steps.length ? steps : [createStep()];
    const editorsById = new Map(
      writable.__steps.map((step, i) => [step.id, writable.__stepEditors[i]] as const),
    );
    writable.__steps = next;
    writable.__stepEditors = next.map((step) => editorsById.get(step.id) ?? createStepEditor(step));
  }

  setStepTitle(id: string, title: string): void {
    const writable = this.getWritable();
    writable.__steps = writable.__steps.map((step) => (step.id === id ? { ...step, title } : step));
  }

  addStepAfter(id: string): StepItem {
    const writable = this.getWritable();
    const index = writable.__steps.findIndex((step) => step.id === id);
    const at = index === -1 ? writable.__steps.length : index + 1;
    const step = createStep();
    writable.__steps = [...writable.__steps.slice(0, at), step, ...writable.__steps.slice(at)];
    writable.__stepEditors = [
      ...writable.__stepEditors.slice(0, at),
      createStepEditor(step),
      ...writable.__stepEditors.slice(at),
    ];
    return step;
  }

  removeStep(id: string): void {
    const writable = this.getWritable();
    const index = writable.__steps.findIndex((step) => step.id === id);
    if (index === -1) return;
    if (writable.__steps.length === 1) {
      const step = createStep();
      writable.__steps = [step];
      writable.__stepEditors = [createStepEditor(step)];
      return;
    }
    writable.__steps = writable.__steps.filter((_, i) => i !== index);
    writable.__stepEditors = writable.__stepEditors.filter((_, i) => i !== index);
  }

  moveStep(id: string, delta: -1 | 1): void {
    const index = this.getLatest().__steps.findIndex((step) => step.id === id);
    const target = index + delta;
    if (index === -1 || target < 0 || target >= this.getLatest().__steps.length) return;
    const writable = this.getWritable();
    const steps = [...writable.__steps];
    const editors = [...writable.__stepEditors];
    [steps[index], steps[target]] = [steps[target], steps[index]];
    [editors[index], editors[target]] = [editors[target], editors[index]];
    writable.__steps = steps;
    writable.__stepEditors = editors;
  }

  static importJSON(
    _serializedNode: SerializedLexicalNode & Record<string, unknown>,
  ): StepsEditNode {
    const serializedNode = _serializedNode as unknown as SerializedStepsNode;
    return new StepsEditNode(normalizeSteps(serializedNode.steps)).updateFromJSON(_serializedNode);
  }

  exportJSON(): SerializedStepsNode {
    const editors = this.__stepEditors;
    return {
      ...super.exportJSON(),
      steps: this.__steps.map((step, i) => ({
        ...step,
        content: editors[i]?.getEditorState().toJSON() ?? step.content,
      })),
    };
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): ReactElement {
    return createElement(StepsEditDecorator, {
      nodeKey: this.__key,
      steps: this.__steps,
      stepEditors: this.__stepEditors,
    });
  }
}

export function $createStepsEditNode(steps?: StepItem[]): StepsEditNode {
  return new StepsEditNode(steps);
}

export function $isStepsEditNode(node: LexicalNode | null | undefined): node is StepsEditNode {
  return node instanceof StepsEditNode;
}
