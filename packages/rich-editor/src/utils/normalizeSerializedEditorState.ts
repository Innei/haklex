import type { SerializedEditorState } from 'lexical';

const createEmptyParagraphNode = () => ({
  children: [],
  direction: null,
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  type: 'paragraph',
  version: 1,
});

export function normalizeSerializedEditorState(
  state: SerializedEditorState | null | undefined,
): SerializedEditorState {
  const root = state?.root as Record<string, unknown> | undefined;
  const children = Array.isArray(root?.children) ? [...root.children] : [];

  if (root?.type === 'root' && children.length > 0) {
    return state as SerializedEditorState;
  }

  if (!state) {
    return {
      root: {
        children: [createEmptyParagraphNode()],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as SerializedEditorState;
  }

  return {
    ...state,
    root: {
      ...root,
      children: children.length > 0 ? children : [createEmptyParagraphNode()],
      direction: root?.direction ?? null,
      format: typeof root?.format === 'string' ? root.format : '',
      indent: typeof root?.indent === 'number' ? root.indent : 0,
      type: 'root',
      version: typeof root?.version === 'number' ? root.version : 1,
    },
  } as SerializedEditorState;
}
