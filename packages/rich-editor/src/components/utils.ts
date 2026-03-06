import { articleVariant } from '../styles/article.css'
import { commentVariant } from '../styles/comment.css'
import { noteVariant } from '../styles/note.css'
import type { RichEditorVariant } from '../types'

export function clsx(
  ...args: Array<string | undefined | null | false>
): string {
  return args.filter(Boolean).join(' ')
}

export function getVariantClass(variant: RichEditorVariant): string {
  if (variant === 'comment') return commentVariant
  if (variant === 'note') return noteVariant
  return articleVariant
}
