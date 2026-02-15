import { globalStyle, style } from '@vanilla-extract/css'

import { richContent } from './shared.css'
import { commentTheme, darkCommentTheme, vars } from './vars.css'

const commentBase = style({
  fontSize: vars.typography.fontSizeBase,
  lineHeight: vars.typography.lineHeight,
})

export const commentVariant = style([richContent, commentTheme, commentBase])
export const darkCommentVariant = style([
  richContent,
  darkCommentTheme,
  commentBase,
])

// ─── Paragraphs (tighter) ───────────────────────────────
globalStyle(`${commentBase} .rich-paragraph`, {
  marginBottom: '0.6em',
})

// ─── Headings (smaller, compact) ────────────────────────
globalStyle(`${commentBase} .rich-heading-h1`, {
  fontSize: '1.35em',
  fontWeight: 700,
  marginTop: '0.8em',
  marginBottom: '0.3em',
})

globalStyle(`${commentBase} .rich-heading-h2`, {
  fontSize: '1.2em',
  fontWeight: 700,
  marginTop: '0.7em',
  marginBottom: '0.25em',
})

globalStyle(`${commentBase} .rich-heading-h3`, {
  fontSize: '1.1em',
  fontWeight: 600,
  marginTop: '0.6em',
  marginBottom: '0.2em',
})

globalStyle(`${commentBase} .rich-heading-h4`, {
  fontSize: '1em',
  fontWeight: 600,
  marginTop: '0.5em',
  marginBottom: '0.15em',
})

globalStyle(`${commentBase} .rich-heading-h5`, {
  fontSize: '0.9em',
  fontWeight: 600,
  marginTop: '0.45em',
  marginBottom: '0.1em',
})

globalStyle(`${commentBase} .rich-heading-h6`, {
  fontSize: '0.85em',
  fontWeight: 600,
  marginTop: '0.4em',
  marginBottom: '0.1em',
})

// ─── Blockquote (compact) ───────────────────────────────
globalStyle(`${commentBase} .rich-quote`, {
  borderLeftWidth: '3px',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  margin: `${vars.spacing.sm} 0`,
  fontSize: '0.95em',
})

// ─── Lists (compact) ───────────────────────────────────
globalStyle(`${commentBase} .rich-list-ol, ${commentBase} .rich-list-ul`, {
  marginBottom: '0.6em',
  paddingLeft: vars.spacing.md,
})

globalStyle(`${commentBase} .rich-list-item`, {
  marginBottom: '0.1em',
})

// ─── Code block (compact) ──────────────────────────────
globalStyle(`${commentBase} .rich-code-block`, {
  margin: `${vars.spacing.sm} 0`,
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSizeSmall,
})

globalStyle(`${commentBase} .rich-code-block pre`, {
  padding: vars.spacing.sm,
})

// ─── Table (compact cells) ─────────────────────────────
globalStyle(`${commentBase} .rich-table`, {
  margin: `${vars.spacing.sm} 0`,
  fontSize: vars.typography.fontSizeSmall,
})

globalStyle(
  `${commentBase} .rich-table-cell, ${commentBase} .rich-table-cell-header`,
  {
    padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  },
)

// ─── Images (less margin) ──────────────────────────────
globalStyle(`${commentBase} .rich-image`, {
  margin: `${vars.spacing.sm} 0`,
})

globalStyle(`${commentBase} .rich-image figcaption`, {
  fontSize: vars.typography.fontSizeSmall,
})

// ─── HR (compact, match markdown short centered line) ───
globalStyle(`${commentBase} .rich-hr`, {
  border: 'none',
  borderTop: `1px solid ${vars.color.border}`,
  margin: `${vars.spacing.lg} auto`,
  width: 60,
})

// ─── Alert (compact) ───────────────────────────────────
globalStyle(`${commentBase} .rich-alert`, {
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  margin: `${vars.spacing.sm} 0`,
  borderLeftWidth: '3px',
})

// ─── KaTeX block (compact) ─────────────────────────────
globalStyle(`${commentBase} .rich-katex-block`, {
  padding: `${vars.spacing.sm} 0`,
  margin: `${vars.spacing.sm} 0`,
})
