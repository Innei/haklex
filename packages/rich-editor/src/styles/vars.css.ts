import {
  articleLayout,
  commentLayout,
  darkColors,
  lightArticleColors,
  lightCommentColors,
  noteLayout,
  vars,
} from '@shiro/rich-style-token'
import { createGlobalTheme, createTheme } from '@vanilla-extract/css'

// Fallback defaults on :root (light article theme)
createGlobalTheme(':root', vars, {
  color: lightArticleColors,
  ...articleLayout,
})

export const articleTheme = createTheme(vars, {
  color: lightArticleColors,
  ...articleLayout,
})

export const commentTheme = createTheme(vars, {
  color: lightCommentColors,
  ...commentLayout,
})

export const darkArticleTheme = createTheme(vars, {
  color: darkColors,
  ...articleLayout,
})

export const darkCommentTheme = createTheme(vars, {
  color: darkColors,
  ...commentLayout,
})

export const noteTheme = createTheme(vars, {
  color: lightArticleColors,
  ...noteLayout,
})

export const darkNoteTheme = createTheme(vars, {
  color: darkColors,
  ...noteLayout,
})

// Re-export for backward compatibility
export { vars } from '@shiro/rich-style-token'
