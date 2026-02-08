import { TRANSFORMERS } from '@lexical/markdown'

import { KATEX_BLOCK_TRANSFORMER, KATEX_INLINE_TRANSFORMER } from './katex'
import { MENTION_TRANSFORMER } from './mention'
import { SPOILER_TRANSFORMER } from './spoiler'

export const ALL_TRANSFORMERS = [
  SPOILER_TRANSFORMER,
  MENTION_TRANSFORMER,
  KATEX_INLINE_TRANSFORMER,
  KATEX_BLOCK_TRANSFORMER,
  ...TRANSFORMERS,
]

export { KATEX_BLOCK_TRANSFORMER, KATEX_INLINE_TRANSFORMER } from './katex'
export { MENTION_TRANSFORMER } from './mention'
export { SPOILER_TRANSFORMER } from './spoiler'
