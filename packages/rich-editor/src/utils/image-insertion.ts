import { $getTableCellNodeFromLexicalNode } from '@lexical/table';
import {
  $getEditor,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  type LexicalNode,
} from 'lexical';

import type { ImageNodePayload } from '../nodes/ImageNode';

function $getSelectionAnchorNode(): LexicalNode | null {
  const selection = $getSelection();

  if ($isRangeSelection(selection)) {
    return selection.anchor.getNode();
  }

  if ($isNodeSelection(selection)) {
    return selection.getNodes()[0] ?? null;
  }

  return null;
}

export function $isSelectionInTableCell(): boolean {
  const anchorNode = $getSelectionAnchorNode();
  return anchorNode ? $getTableCellNodeFromLexicalNode(anchorNode) !== null : false;
}

export function $isInNestedEditor(): boolean {
  return $getEditor()._parentEditor !== null;
}

export function $withAdaptiveImageDisplayWidth(payload: ImageNodePayload): ImageNodePayload {
  if (payload.displayWidth !== undefined || (!$isSelectionInTableCell() && !$isInNestedEditor())) {
    return payload;
  }

  return {
    ...payload,
    displayWidth: 100,
  };
}
