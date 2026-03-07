import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';

export type DiffOpType = 'equal' | 'insert' | 'delete';

export interface DiffHunk {
  nodes: SerializedLexicalNode[];
  type: DiffOpType;
}

type NodeRecord = Record<string, unknown>;

type SerializedTextNodeLike = SerializedLexicalNode & {
  type: 'text';
  text: string;
  style?: string;
};

type MarkKind = 'insert' | 'delete';

type TextDiffKind = 'equal' | 'insert' | 'delete';

interface TextDiffOp {
  kind: TextDiffKind;
  text: string;
}

interface InlineChildrenDiffResult {
  changed: boolean;
  newChildren: SerializedLexicalNode[];
  oldChildren: SerializedLexicalNode[];
}

const CHAR_DIFF_MAX_MATRIX_CELLS = 50_000;

const DELETE_MARK_STYLE =
  'background-color: color-mix(in srgb, var(--rc-alert-caution) 22%, transparent); text-decoration: line-through;';
const INSERT_MARK_STYLE =
  'background-color: color-mix(in srgb, var(--rc-alert-tip) 22%, transparent);';

function getNodeTypeKey(node: SerializedLexicalNode): string {
  const n = node as NodeRecord;
  if (n.type === 'heading') return `heading:${n.tag}`;
  if (n.type === 'list') return `list:${n.listType}`;
  return (n.type as string) || 'unknown';
}

function nodesEqual(a: SerializedLexicalNode, b: SerializedLexicalNode): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isTextNode(node: SerializedLexicalNode): node is SerializedTextNodeLike {
  const n = node as NodeRecord;
  return n.type === 'text' && typeof n.text === 'string';
}

function getChildren(node: SerializedLexicalNode): SerializedLexicalNode[] | null {
  const n = node as NodeRecord;
  return Array.isArray(n.children) ? (n.children as SerializedLexicalNode[]) : null;
}

function appendStyle(baseStyle: unknown, extraStyle: string): string {
  const normalizedBase = typeof baseStyle === 'string' ? baseStyle.trim() : '';
  if (!normalizedBase) return extraStyle;
  return `${normalizedBase}${normalizedBase.endsWith(';') ? '' : ';'} ${extraStyle}`;
}

function cloneTextNode(
  node: SerializedTextNodeLike,
  text: string,
  markKind?: MarkKind,
): SerializedLexicalNode {
  let { style } = node;
  if (markKind === 'delete') {
    style = appendStyle(style, DELETE_MARK_STYLE);
  } else if (markKind === 'insert') {
    style = appendStyle(style, INSERT_MARK_STYLE);
  }

  const cloned: SerializedTextNodeLike = {
    ...node,
    text,
    style,
  };
  return cloned as SerializedLexicalNode;
}

function cloneNodeWithChildren(
  node: SerializedLexicalNode,
  children: SerializedLexicalNode[],
): SerializedLexicalNode {
  return {
    ...(node as NodeRecord),
    children,
  } as unknown as SerializedLexicalNode;
}

function decorateSubtree(node: SerializedLexicalNode, kind: MarkKind): SerializedLexicalNode {
  if (isTextNode(node)) {
    return cloneTextNode(node, node.text, kind);
  }

  const children = getChildren(node);
  if (!children) return node;

  return cloneNodeWithChildren(
    node,
    children.map((child) => decorateSubtree(child, kind)),
  );
}

function reverseText(value: string): string {
  return Array.from(value).reverse().join('');
}

function mergeTextOps(ops: TextDiffOp[]): TextDiffOp[] {
  const merged: TextDiffOp[] = [];
  for (const op of ops) {
    if (!op.text) continue;
    const last = merged.at(-1);
    if (last && last.kind === op.kind) {
      last.text += op.text;
    } else {
      merged.push({ ...op });
    }
  }
  return merged;
}

function diffMiddleChars(oldChars: string[], newChars: string[]): TextDiffOp[] {
  const m = oldChars.length;
  const n = newChars.length;

  if (m === 0 && n === 0) return [];
  if (m === 0) return [{ kind: 'insert', text: newChars.join('') }];
  if (n === 0) return [{ kind: 'delete', text: oldChars.join('') }];

  if (m * n > CHAR_DIFF_MAX_MATRIX_CELLS) {
    return [
      { kind: 'delete', text: oldChars.join('') },
      { kind: 'insert', text: newChars.join('') },
    ];
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from<number>({ length: n + 1 }).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldChars[i - 1] === newChars[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const reversedOps: TextDiffOp[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (oldChars[i - 1] === newChars[j - 1]) {
      const last = reversedOps.at(-1);
      if (last && last.kind === 'equal') {
        last.text += oldChars[i - 1];
      } else {
        reversedOps.push({ kind: 'equal', text: oldChars[i - 1] });
      }
      i--;
      j--;
      continue;
    }

    if (dp[i - 1][j] >= dp[i][j - 1]) {
      const last = reversedOps.at(-1);
      if (last && last.kind === 'delete') {
        last.text += oldChars[i - 1];
      } else {
        reversedOps.push({ kind: 'delete', text: oldChars[i - 1] });
      }
      i--;
    } else {
      const last = reversedOps.at(-1);
      if (last && last.kind === 'insert') {
        last.text += newChars[j - 1];
      } else {
        reversedOps.push({ kind: 'insert', text: newChars[j - 1] });
      }
      j--;
    }
  }

  while (i > 0) {
    const last = reversedOps.at(-1);
    if (last && last.kind === 'delete') {
      last.text += oldChars[i - 1];
    } else {
      reversedOps.push({ kind: 'delete', text: oldChars[i - 1] });
    }
    i--;
  }

  while (j > 0) {
    const last = reversedOps.at(-1);
    if (last && last.kind === 'insert') {
      last.text += newChars[j - 1];
    } else {
      reversedOps.push({ kind: 'insert', text: newChars[j - 1] });
    }
    j--;
  }

  const forwardOps = reversedOps
    .reverse()
    .map((op) => ({ kind: op.kind, text: reverseText(op.text) }));

  return mergeTextOps(forwardOps);
}

function diffTextByChar(oldText: string, newText: string): TextDiffOp[] {
  const oldChars = Array.from(oldText);
  const newChars = Array.from(newText);

  let prefix = 0;
  while (
    prefix < oldChars.length &&
    prefix < newChars.length &&
    oldChars[prefix] === newChars[prefix]
  ) {
    prefix++;
  }

  let oldSuffix = oldChars.length - 1;
  let newSuffix = newChars.length - 1;

  while (
    oldSuffix >= prefix &&
    newSuffix >= prefix &&
    oldChars[oldSuffix] === newChars[newSuffix]
  ) {
    oldSuffix--;
    newSuffix--;
  }

  const ops: TextDiffOp[] = [];
  if (prefix > 0) {
    ops.push({
      kind: 'equal',
      text: oldChars.slice(0, prefix).join(''),
    });
  }

  ops.push(
    ...diffMiddleChars(
      oldChars.slice(prefix, oldSuffix + 1),
      newChars.slice(prefix, newSuffix + 1),
    ),
  );

  if (oldSuffix < oldChars.length - 1) {
    ops.push({
      kind: 'equal',
      text: oldChars.slice(oldSuffix + 1).join(''),
    });
  }

  return mergeTextOps(ops);
}

function splitTextNodeByCharDiff(
  oldNode: SerializedTextNodeLike,
  newNode: SerializedTextNodeLike,
): {
  oldNodes: SerializedLexicalNode[];
  newNodes: SerializedLexicalNode[];
  changed: boolean;
} {
  const ops = diffTextByChar(oldNode.text, newNode.text);
  const oldNodes: SerializedLexicalNode[] = [];
  const newNodes: SerializedLexicalNode[] = [];
  let changed = false;

  for (const op of ops) {
    if (!op.text) continue;

    if (op.kind === 'equal') {
      oldNodes.push(cloneTextNode(oldNode, op.text));
      newNodes.push(cloneTextNode(newNode, op.text));
      continue;
    }

    changed = true;
    if (op.kind === 'delete') {
      oldNodes.push(cloneTextNode(oldNode, op.text, 'delete'));
      continue;
    }

    newNodes.push(cloneTextNode(newNode, op.text, 'insert'));
  }

  return {
    oldNodes: oldNodes.length > 0 ? oldNodes : [oldNode],
    newNodes: newNodes.length > 0 ? newNodes : [newNode],
    changed,
  };
}

type AlignOp =
  | { kind: 'equal'; node: SerializedLexicalNode }
  | {
      kind: 'modify';
      oldNode: SerializedLexicalNode;
      newNode: SerializedLexicalNode;
    }
  | { kind: 'delete'; node: SerializedLexicalNode }
  | { kind: 'insert'; node: SerializedLexicalNode };

/**
 * LCS-based structural alignment.
 *
 * Scoring:
 *   exact match  → +2 (always align)
 *   type match   → +1 (prefer align over skip)
 *   type mismatch → not considered (never align different types)
 */
function alignNodes(
  oldNodes: SerializedLexicalNode[],
  newNodes: SerializedLexicalNode[],
): AlignOp[] {
  const m = oldNodes.length;
  const n = newNodes.length;

  // DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from<number>({ length: n + 1 }).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const skip = Math.max(dp[i - 1][j], dp[i][j - 1]);

      if (getNodeTypeKey(oldNodes[i - 1]) === getNodeTypeKey(newNodes[j - 1])) {
        const score = nodesEqual(oldNodes[i - 1], newNodes[j - 1]) ? 2 : 1;
        dp[i][j] = Math.max(skip, dp[i - 1][j - 1] + score);
      } else {
        dp[i][j] = skip;
      }
    }
  }

  // Backtrack
  const ops: AlignOp[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    const typeMatch = getNodeTypeKey(oldNodes[i - 1]) === getNodeTypeKey(newNodes[j - 1]);

    if (typeMatch) {
      const exact = nodesEqual(oldNodes[i - 1], newNodes[j - 1]);
      const score = exact ? 2 : 1;

      if (dp[i][j] === dp[i - 1][j - 1] + score) {
        ops.push(
          exact
            ? { kind: 'equal', node: oldNodes[i - 1] }
            : {
                kind: 'modify',
                oldNode: oldNodes[i - 1],
                newNode: newNodes[j - 1],
              },
        );
        i--;
        j--;
        continue;
      }
    }

    if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ kind: 'delete', node: oldNodes[i - 1] });
      i--;
    } else {
      ops.push({ kind: 'insert', node: newNodes[j - 1] });
      j--;
    }
  }

  while (i > 0) {
    ops.push({ kind: 'delete', node: oldNodes[--i] });
  }
  while (j > 0) {
    ops.push({ kind: 'insert', node: newNodes[--j] });
  }

  ops.reverse();
  return ops;
}

function diffChildrenInline(
  oldChildren: SerializedLexicalNode[],
  newChildren: SerializedLexicalNode[],
): InlineChildrenDiffResult {
  const ops = alignNodes(oldChildren, newChildren);

  const nextOldChildren: SerializedLexicalNode[] = [];
  const nextNewChildren: SerializedLexicalNode[] = [];
  let changed = false;

  for (const op of ops) {
    switch (op.kind) {
      case 'equal': {
        nextOldChildren.push(op.node);
        nextNewChildren.push(op.node);
        break;
      }
      case 'delete': {
        changed = true;
        nextOldChildren.push(decorateSubtree(op.node, 'delete'));
        break;
      }
      case 'insert': {
        changed = true;
        nextNewChildren.push(decorateSubtree(op.node, 'insert'));
        break;
      }
      case 'modify': {
        changed = true;

        if (isTextNode(op.oldNode) && isTextNode(op.newNode)) {
          const textDiff = splitTextNodeByCharDiff(op.oldNode, op.newNode);
          nextOldChildren.push(...textDiff.oldNodes);
          nextNewChildren.push(...textDiff.newNodes);
          break;
        }

        const nested = diffNodeInline(op.oldNode, op.newNode);
        if (nested) {
          nextOldChildren.push(nested.oldNode);
          nextNewChildren.push(nested.newNode);
        } else {
          nextOldChildren.push(decorateSubtree(op.oldNode, 'delete'));
          nextNewChildren.push(decorateSubtree(op.newNode, 'insert'));
        }
        break;
      }
    }
  }

  return {
    oldChildren: nextOldChildren,
    newChildren: nextNewChildren,
    changed,
  };
}

function diffNodeInline(
  oldNode: SerializedLexicalNode,
  newNode: SerializedLexicalNode,
): {
  oldNode: SerializedLexicalNode;
  newNode: SerializedLexicalNode;
  changed: boolean;
} | null {
  if (getNodeTypeKey(oldNode) !== getNodeTypeKey(newNode)) return null;
  if (nodesEqual(oldNode, newNode)) {
    return { oldNode, newNode, changed: false };
  }

  const oldChildren = getChildren(oldNode);
  const newChildren = getChildren(newNode);
  if (!oldChildren || !newChildren) return null;

  const childDiff = diffChildrenInline(oldChildren, newChildren);
  if (!childDiff.changed) {
    return { oldNode, newNode, changed: false };
  }

  return {
    oldNode: cloneNodeWithChildren(oldNode, childDiff.oldChildren),
    newNode: cloneNodeWithChildren(newNode, childDiff.newChildren),
    changed: true,
  };
}

function diffModifiedNode(
  oldNode: SerializedLexicalNode,
  newNode: SerializedLexicalNode,
): {
  oldNode: SerializedLexicalNode;
  newNode: SerializedLexicalNode;
} {
  const nested = diffNodeInline(oldNode, newNode);
  if (nested) {
    return { oldNode: nested.oldNode, newNode: nested.newNode };
  }

  return {
    oldNode: decorateSubtree(oldNode, 'delete'),
    newNode: decorateSubtree(newNode, 'insert'),
  };
}

export function computeDiff(
  oldState: SerializedEditorState,
  newState: SerializedEditorState,
): DiffHunk[] {
  const ops = alignNodes(oldState.root.children, newState.root.children);

  const hunks: DiffHunk[] = [];

  for (const op of ops) {
    switch (op.kind) {
      case 'equal': {
        const last = hunks.at(-1);
        if (last && last.type === 'equal') {
          last.nodes.push(op.node);
        } else {
          hunks.push({ type: 'equal', nodes: [op.node] });
        }
        break;
      }
      case 'modify': {
        // Per-node delete+insert pair — do NOT merge with neighbors
        {
          const inline = diffModifiedNode(op.oldNode, op.newNode);
          hunks.push(
            { type: 'delete', nodes: [inline.oldNode] },
            { type: 'insert', nodes: [inline.newNode] },
          );
        }
        break;
      }
      case 'delete': {
        hunks.push({
          type: 'delete',
          nodes: [decorateSubtree(op.node, 'delete')],
        });
        break;
      }
      case 'insert': {
        hunks.push({
          type: 'insert',
          nodes: [decorateSubtree(op.node, 'insert')],
        });
        break;
      }
    }
  }

  return hunks;
}
