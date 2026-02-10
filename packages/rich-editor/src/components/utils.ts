import type { ColorScheme } from '../context/ColorSchemeContext'
import { articleVariant, darkArticleVariant } from '../styles/article.css'
import { commentVariant, darkCommentVariant } from '../styles/comment.css'
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
  return colorScheme === 'dark' ? darkArticleVariant : articleVariant
}
