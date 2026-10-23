import type { SerializedEditorState } from 'lexical';
import { customAlphabet } from 'nanoid';

import type { StepItem } from './types';

const makeId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

export function createStepId(): string {
  return `s_${makeId()}`;
}

export function createEmptyContentState(): SerializedEditorState {
  return {
    root: {
      children: [
        {
          type: 'paragraph',
          children: [],
          direction: null,
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  } as unknown as SerializedEditorState;
}

export function createStep(title = ''): StepItem {
  return { id: createStepId(), title, content: createEmptyContentState() };
}

export function normalizeSteps(raw: unknown): StepItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const step = (item && typeof item === 'object' ? item : {}) as Partial<StepItem>;
    return {
      ...step,
      id: typeof step.id === 'string' && step.id ? step.id : createStepId(),
      title: typeof step.title === 'string' ? step.title : '',
      content: step.content?.root ? step.content : createEmptyContentState(),
    };
  });
}
