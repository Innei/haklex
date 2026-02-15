import type { ColorScheme } from '../context/ColorSchemeContext'
import { articleVariant, darkArticleVariant } from '../styles/article.css'
import { commentVariant, darkCommentVariant } from '../styles/comment.css'
import { darkNoteVariant, noteVariant } from '../styles/note.css'
import type { RichEditorVariant } from '../types'

export function clsx(
  ...args: Array<string | undefined | null | false>
): string {
  return args.filter(Boolean).join(' ')
}

export function getVariantClass(
  variant: RichEditorVariant,
  colorScheme: ColorScheme,
): string {
  if (variant === 'comment') {
    return colorScheme === 'dark' ? darkCommentVariant : commentVariant
  }
  if (variant === 'note') {
    return colorScheme === 'dark' ? darkNoteVariant : noteVariant
  }
  return colorScheme === 'dark' ? darkArticleVariant : articleVariant
}
