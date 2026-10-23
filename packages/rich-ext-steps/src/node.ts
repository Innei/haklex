import type { Klass, LexicalNode } from 'lexical';

import { StepsNode } from './nodes/StepsNode';

export * from './augment';
export { $createStepsNode, $isStepsNode, StepsNode } from './nodes/StepsNode';
export { STEPS_NODE_KEY } from './slot';
export { STEPS_BLOCK_TRANSFORMER, stepsToMarkdown } from './transformer';
export type { SerializedStepsNode, StepItem, StepsRendererProps } from './types';
export { createStep, createStepId, normalizeSteps } from './utils';

export const stepsNodes: Array<Klass<LexicalNode>> = [StepsNode];
