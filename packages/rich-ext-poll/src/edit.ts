import './poll-edit.css';

import type { Klass, LexicalNode } from 'lexical';

import { PollEditNode } from './nodes/PollEditNode';

export * from './augment';
export { $createPollEditNode, PollEditNode } from './nodes/PollEditNode';
export { pollEditClasses } from './poll-edit.css';
export { PollEditDecorator } from './PollEditDecorator';

export const pollEditNodes: Array<Klass<LexicalNode>> = [PollEditNode];
