import { extractTextContent } from '@haklex/rich-editor/static';
import type { ElementTransformer } from '@lexical/markdown';
import type { LexicalNode } from 'lexical';

import { $isStepsNode } from './nodes/StepsNode';
import type { StepItem } from './types';

function quoteAttr(value: string): string {
  return value.replaceAll('"', '\\"');
}

export function stepsToMarkdown(steps: StepItem[]): string {
  const body = steps
    .map(
      (step) =>
        `::: step{title="${quoteAttr(step.title)}"}\n${extractTextContent(step.content)}\n:::`,
    )
    .join('\n');
  return `::: steps\n${body}\n:::`;
}

export const STEPS_BLOCK_TRANSFORMER: ElementTransformer = {
  dependencies: [],
  export: (node: LexicalNode) => {
    if (!$isStepsNode(node)) return null;
    return stepsToMarkdown(node.getSteps());
  },
  regExp: /\b\B/,
  replace: () => {},
  type: 'element',
};
