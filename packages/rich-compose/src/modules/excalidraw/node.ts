import {
  $createExcalidrawNode,
  $isExcalidrawNode,
  ExcalidrawNode,
} from '@haklex/rich-ext-excalidraw/static';
import type { Klass, LexicalNode } from 'lexical';

export type { SerializedExcalidrawNode } from '@haklex/rich-ext-excalidraw/static';
export { $createExcalidrawNode, $isExcalidrawNode, ExcalidrawNode };

export const excalidrawNodes: Array<Klass<LexicalNode>> = [ExcalidrawNode];
