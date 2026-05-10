import './styles.css';

import type { Klass, LexicalNode } from 'lexical';

import { ChatEditNode } from './nodes/ChatEditNode';

export * from './augment';
export type { ChatEditDecoratorProps } from './ChatEditDecorator';
export { ChatEditDecorator } from './ChatEditDecorator';
export type { ChatEditorModalProps } from './ChatEditorModal';
export { ChatEditorModal } from './ChatEditorModal';
export type { ChatEditRendererProps } from './ChatEditRenderer';
export { ChatEditRenderer } from './ChatEditRenderer';
export { $createChatEditNode, $isChatEditNode, ChatEditNode } from './nodes/ChatEditNode';

export const chatEditNodes: Array<Klass<LexicalNode>> = [ChatEditNode];
