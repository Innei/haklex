import { TRANSFORMERS } from '@lexical/markdown'

import { GIT_ALERT_TRANSFORMER } from './alert'
import { CONTAINER_TRANSFORMER } from './container'
import { FOOTNOTE_SECTION_TRANSFORMER, FOOTNOTE_TRANSFORMER } from './footnote'
import { INSERT_TRANSFORMER } from './insert'
import { KATEX_BLOCK_TRANSFORMER, KATEX_INLINE_TRANSFORMER } from './katex'
import { MENTION_TRANSFORMER } from './mention'
import { SPOILER_TRANSFORMER } from './spoiler'
import { TASK_LIST_ITEM_TRANSFORMER } from './tasklist'

export const ALL_TRANSFORMERS = [
  // Inline transformers
  SPOILER_TRANSFORMER,
  MENTION_TRANSFORMER,
  FOOTNOTE_TRANSFORMER,
  INSERT_TRANSFORMER,
  KATEX_INLINE_TRANSFORMER,
  // Block transformers (order matters - more specific first)
  FOOTNOTE_SECTION_TRANSFORMER,
  CONTAINER_TRANSFORMER,
  GIT_ALERT_TRANSFORMER,
  TASK_LIST_ITEM_TRANSFORMER,
  KATEX_BLOCK_TRANSFORMER,
  ...TRANSFORMERS,
]

export { GIT_ALERT_TRANSFORMER } from './alert'
export { CONTAINER_TRANSFORMER } from './container'
export { FOOTNOTE_SECTION_TRANSFORMER, FOOTNOTE_TRANSFORMER } from './footnote'
export { INSERT_TRANSFORMER } from './insert'
export { KATEX_BLOCK_TRANSFORMER, KATEX_INLINE_TRANSFORMER } from './katex'
export { MENTION_TRANSFORMER } from './mention'
export { SPOILER_TRANSFORMER } from './spoiler'
export { TASK_LIST_ITEM_TRANSFORMER } from './tasklist'
