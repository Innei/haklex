import { $createDynamicNode, $isDynamicNode, DynamicNode } from '@haklex/rich-ext-dynamic/static';
import type { Klass, LexicalNode } from 'lexical';

export type { SerializedDynamicNode } from '@haklex/rich-ext-dynamic/static';
export { $createDynamicNode, $isDynamicNode, DynamicNode };

export const dynamicNodes: Array<Klass<LexicalNode>> = [DynamicNode];
