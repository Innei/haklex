import {
  $createRangeSelection,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  type BaseSelection,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type PointType,
  type RangeSelection,
} from 'lexical';

type InsertionPoint =
  | { kind: 'after'; key: NodeKey }
  | { kind: 'point'; key: NodeKey; offset: number; type: 'element' | 'text' };

export interface InsertionCursor {
  callerMoved: boolean;
  expected: BaseSelection | null;
  point: InsertionPoint | null;
}

function $capturePoint(selection: BaseSelection | null): InsertionPoint | null {
  if ($isRangeSelection(selection)) {
    const end = selection.isBackward() ? selection.anchor : selection.focus;
    return { kind: 'point', key: end.key, offset: end.offset, type: end.type };
  }
  if ($isNodeSelection(selection)) {
    const last = selection.getNodes().at(-1);
    if (last) return { kind: 'after', key: last.getKey() };
  }
  return null;
}

export function $createInsertionCursor(): InsertionCursor {
  const selection = $getSelection();
  return {
    callerMoved: false,
    expected: selection?.clone() ?? null,
    point: $capturePoint(selection),
  };
}

export function readInsertionCursor(active: LexicalEditor, target: LexicalEditor): InsertionCursor {
  return active === target
    ? $createInsertionCursor()
    : target.getEditorState().read($createInsertionCursor);
}

function $pointSize(key: NodeKey, type: 'element' | 'text'): number | null {
  const node = $getNodeByKey(key);
  if (!node?.isAttached()) return null;
  if (type === 'text') return $isTextNode(node) ? node.getTextContentSize() : null;
  return $isElementNode(node) ? node.getChildrenSize() : null;
}

function $resolvePoint(point: InsertionPoint | null): RangeSelection | null {
  if (!point) return null;
  let key = point.key;
  let offset: number;
  let type: 'element' | 'text' = 'element';
  if (point.kind === 'after') {
    const node = $getNodeByKey(point.key);
    const parent = node?.isAttached() ? node.getParent() : null;
    if (!node || !parent) return null;
    key = parent.getKey();
    offset = node.getIndexWithinParent() + 1;
  } else {
    const size = $pointSize(point.key, point.type);
    if (size === null) return null;
    offset = Math.min(point.offset, size);
    type = point.type;
  }
  const selection = $createRangeSelection();
  selection.anchor.set(key, offset, type);
  selection.focus.set(key, offset, type);
  return selection;
}

function $isPointUsable(point: PointType): boolean {
  const size = $pointSize(point.key, point.type);
  return size !== null && point.offset <= size;
}

function $isSelectionUsable(selection: BaseSelection): boolean {
  if ($isRangeSelection(selection)) {
    return $isPointUsable(selection.anchor) && $isPointUsable(selection.focus);
  }
  return selection.getNodes().every((node) => node.isAttached());
}

export function $insertAtCursor(cursor: InsertionCursor, nodes: LexicalNode[]): void {
  if (nodes.length === 0) return;
  const target = $resolvePoint(cursor.point);
  const current = $getSelection();
  const moved =
    cursor.callerMoved ||
    (current === null ? cursor.expected !== null : !current.is(cursor.expected));
  const restore = moved && current ? current.clone() : null;

  if (target) $setSelection(target);
  $insertNodes(nodes);

  if (restore && $isSelectionUsable(restore)) {
    $setSelection(restore);
    cursor.callerMoved = true;
  }
  cursor.expected = $getSelection()?.clone() ?? null;
  cursor.point = { kind: 'after', key: nodes.at(-1)!.getKey() };
}
