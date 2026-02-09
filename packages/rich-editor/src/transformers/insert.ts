import type { TextFormatTransformer } from '@lexical/markdown'

/**
 * Insert text transformer: ++text++ → underline format
 */
export const INSERT_TRANSFORMER: TextFormatTransformer = {
  format: ['underline'],
  tag: '++',
  type: 'text-format',
}
