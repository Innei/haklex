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

const boundaryTextContainers = new Set(['root', 'quote']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isBoundaryNewlineTextNode(node: unknown): boolean {
  if (!isRecord(node) || node.type !== 'text' || typeof node.text !== 'string') return false;

  return node.text.trim() === '' && /[\n\r]/.test(node.text);
}

function trimBoundaryTextNodes(children: unknown[]): unknown[] {
  let start = 0;
  let end = children.length;

  while (start < end && isBoundaryNewlineTextNode(children[start])) {
    start += 1;
  }

  while (end > start && isBoundaryNewlineTextNode(children[end - 1])) {
    end -= 1;
  }

  return start === 0 && end === children.length ? children : children.slice(start, end);
}

function normalizeSerializedNode(node: unknown): unknown {
  if (!isRecord(node) || !Array.isArray(node.children)) return node;

  let changed = false;
  let children = node.children.map((child) => {
    const normalizedChild = normalizeSerializedNode(child);
    if (normalizedChild !== child) changed = true;
    return normalizedChild;
  });

  if (boundaryTextContainers.has(String(node.type))) {
    const trimmedChildren = trimBoundaryTextNodes(children);
    if (trimmedChildren !== children) {
      changed = true;
      children = trimmedChildren;
    }
  }

  return changed ? { ...node, children } : node;
}

export function normalizeSerializedEditorState(
  state: SerializedEditorState | null | undefined,
): SerializedEditorState {
  const root = state?.root as Record<string, unknown> | undefined;
  const children = Array.isArray(root?.children) ? [...root.children] : [];

  if (root?.type === 'root' && children.length > 0) {
    const normalizedRoot = normalizeSerializedNode(root);
    if (normalizedRoot !== root) {
      return {
        ...state,
        root: normalizedRoot,
      } as SerializedEditorState;
    }

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
    root: normalizeSerializedNode({
      ...root,
      children: children.length > 0 ? children : [createEmptyParagraphNode()],
      direction: root?.direction ?? null,
      format: typeof root?.format === 'string' ? root.format : '',
      indent: typeof root?.indent === 'number' ? root.indent : 0,
      type: 'root',
      version: typeof root?.version === 'number' ? root.version : 1,
    }),
  } as SerializedEditorState;
}
