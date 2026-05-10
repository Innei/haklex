import './augment';

import type { Klass, LexicalNode } from 'lexical';

import { PollNode } from './nodes/PollNode';

export { extractPolls } from './extractPolls';
export type { PollNodePayload, SerializedPollNode } from './nodes/PollNode';
export {
  $createPollNode,
  $isPollNode,
  createOptionId,
  createPollId,
  PollNode,
} from './nodes/PollNode';
export { POLL_NODE_KEY } from './slot';
export type {
  PollDataAdapter,
  PollMetadata,
  PollMode,
  PollOption,
  PollRendererProps,
  PollShowResults,
  PollState,
} from './types';

export const pollNodes: Array<Klass<LexicalNode>> = [PollNode];
