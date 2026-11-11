import {
  $createWhiteboardNode,
  $isWhiteboardNode,
  WhiteboardNode,
} from '@haklex/rich-ext-whiteboard/static';
import type { Klass, LexicalNode } from 'lexical';

export type { SerializedWhiteboardNode } from '@haklex/rich-ext-whiteboard/static';
export { $createWhiteboardNode, $isWhiteboardNode, WhiteboardNode };

export const whiteboardNodes: Array<Klass<LexicalNode>> = [WhiteboardNode];
