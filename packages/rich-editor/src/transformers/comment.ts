import { COMMENT_TRANSFORMER as BASE } from '@haklex/rich-headless/transformers';
import type { TextMatchTransformer } from '@lexical/markdown';

import {
  $createCommentNode,
  $createCommentPlaceholderNode,
  CommentNode,
} from '../nodes/CommentNode';

// eslint-disable-next-line regexp/no-useless-assertions
const NEVER = /a^/;

export const COMMENT_OPEN_TRANSFORMER: TextMatchTransformer = {
  dependencies: [CommentNode],
  export: () => null,
  importRegExp: NEVER,
  regExp: /<!--$/,
  replace: (textNode) => {
    const node = $createCommentPlaceholderNode();
    textNode.replace(node);
    node.select(0, node.getTextContentSize());
  },
  trigger: '-',
  type: 'text-match',
};

export const COMMENT_TRANSFORMER: TextMatchTransformer = {
  ...BASE,
  dependencies: [CommentNode],
  replace: (textNode, match) => {
    textNode.replace($createCommentNode(match[1] ?? ''));
  },
};
