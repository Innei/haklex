import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

export interface StepItem {
  content: SerializedEditorState;
  id: string;
  title: string;
}

export interface StepsRendererProps {
  steps: StepItem[];
}

export interface SerializedStepsNode extends SerializedLexicalNode {
  steps: StepItem[];
  type: 'steps';
  version: 1;
}
