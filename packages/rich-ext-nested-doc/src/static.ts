import './styles.css.ts';

import type { Klass, LexicalNode } from 'lexical';

import { NestedDocNode } from './NestedDocNode';

export type { SerializedNestedDocNode } from './NestedDocNode';
export { $createNestedDocNode, $isNestedDocNode, NestedDocNode } from './NestedDocNode';
export { NestedDocRenderer } from './NestedDocRenderer';
export type { NestedDocPreviewCardProps } from './NestedDocStaticDecorator';
export { NestedDocPreviewCard, NestedDocStaticDecorator } from './NestedDocStaticDecorator';
export type { NestedDocRendererProps } from './slot';
export { NESTED_DOC_NODE_KEY } from './slot';
export { NESTED_DOC_BLOCK_TRANSFORMER } from './transformer';
export { hasRenderableEditorState, truncateEditorState } from './utils';

export const nestedDocNodes: Array<Klass<LexicalNode>> = [NestedDocNode];
