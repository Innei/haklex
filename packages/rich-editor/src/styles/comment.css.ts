import { globalStyle, style } from '@vanilla-extract/css'

import { richContent } from './shared.css'
import { commentTheme, vars } from './vars.css'

export const commentVariant = style([
  richContent,
  commentTheme,
  {
    fontSize: vars.typography.fontSizeBase,
    lineHeight: vars.typography.lineHeight,
  },
])

// ─── Paragraphs (tighter) ───────────────────────────────
globalStyle(`${commentVariant} .rich-paragraph`, {
  marginBottom: '0.6em',
})

// ─── Headings (smaller, compact) ────────────────────────
globalStyle(`${commentVariant} .rich-heading-h1`, {
  fontSize: '1.35em',
  fontWeight: 700,
  marginTop: '0.8em',
  marginBottom: '0.3em',
})

globalStyle(`${commentVariant} .rich-heading-h2`, {
  fontSize: '1.2em',
  fontWeight: 700,
  marginTop: '0.7em',
  marginBottom: '0.25em',
})

globalStyle(`${commentVariant} .rich-heading-h3`, {
  fontSize: '1.1em',
  fontWeight: 600,
  marginTop: '0.6em',
  marginBottom: '0.2em',
})

globalStyle(`${commentVariant} .rich-heading-h4`, {
  fontSize: '1em',
  fontWeight: 600,
  marginTop: '0.5em',
  marginBottom: '0.15em',
})

globalStyle(`${commentVariant} .rich-heading-h5`, {
  fontSize: '0.9em',
  fontWeight: 600,
  marginTop: '0.45em',
  marginBottom: '0.1em',
})

globalStyle(`${commentVariant} .rich-heading-h6`, {
  fontSize: '0.85em',
  fontWeight: 600,
  marginTop: '0.4em',
  marginBottom: '0.1em',
})

// ─── Blockquote (compact) ───────────────────────────────
globalStyle(`${commentVariant} .rich-quote`, {
  borderLeftWidth: '3px',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  margin: `${vars.spacing.sm} 0`,
  fontSize: '0.95em',
})

// ─── Lists (compact) ───────────────────────────────────
globalStyle(
  `${commentVariant} .rich-list-ol, ${commentVariant} .rich-list-ul`,
  {
    marginBottom: '0.6em',
    paddingLeft: vars.spacing.md,
  },
)

globalStyle(`${commentVariant} .rich-list-item`, {
  marginBottom: '0.1em',
})

// ─── Code block (compact) ──────────────────────────────
globalStyle(`${commentVariant} .rich-code-block`, {
  margin: `${vars.spacing.sm} 0`,
  borderRadius: vars.borderRadius.sm,
  fontSize: vars.typography.fontSizeSmall,
})

globalStyle(`${commentVariant} .rich-code-block pre`, {
  padding: vars.spacing.sm,
})

// ─── Table (compact cells) ─────────────────────────────
globalStyle(`${commentVariant} .rich-table`, {
  margin: `${vars.spacing.sm} 0`,
  fontSize: vars.typography.fontSizeSmall,
})

globalStyle(
  `${commentVariant} .rich-table-cell, ${commentVariant} .rich-table-cell-header`,
  {
    padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  },
)

// ─── Images (less margin) ──────────────────────────────
globalStyle(`${commentVariant} .rich-image`, {
  margin: `${vars.spacing.sm} 0`,
})

globalStyle(`${commentVariant} .rich-image figcaption`, {
  fontSize: vars.typography.fontSizeSmall,
})

// ─── HR (compact) ──────────────────────────────────────
globalStyle(`${commentVariant} .rich-hr`, {
  margin: `${vars.spacing.md} 0`,
})

// ─── Alert (compact) ───────────────────────────────────
globalStyle(`${commentVariant} .rich-alert`, {
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  margin: `${vars.spacing.sm} 0`,
  borderLeftWidth: '3px',
})

// ─── KaTeX block (compact) ─────────────────────────────
globalStyle(`${commentVariant} .rich-katex-block`, {
  padding: `${vars.spacing.sm} 0`,
  margin: `${vars.spacing.sm} 0`,
})
