import { globalStyle, style } from '@vanilla-extract/css'

import { richContent } from './shared.css'
import { articleTheme, vars } from './vars.css'

export const articleVariant = style([
  richContent,
  articleTheme,
  {
    maxWidth: '65ch',
    fontSize: vars.typography.fontSizeLarge,
    lineHeight: '1.75',
    color: vars.color.text,
  },
])

// ─── Paragraphs (prose-style spacing) ───────────────────
globalStyle(`${articleVariant} .rich-paragraph`, {
  marginTop: '1.25em',
  marginBottom: '1.25em',
  lineHeight: '1.75',
})

globalStyle(`${articleVariant} .rich-paragraph:first-child`, {
  marginTop: 0,
})

globalStyle(`${articleVariant} .rich-paragraph:last-child`, {
  marginBottom: 0,
})

// ─── Headings (prose-style hierarchy) ───────────────────
// H1: Article title level - most prominent
globalStyle(`${articleVariant} .rich-heading-h1`, {
  fontSize: '2.25em',
  fontWeight: 800,
  lineHeight: '1.1111111',
  marginTop: 0,
  marginBottom: '0.8888889em',
  letterSpacing: '-0.025em',
  color: vars.color.text,
})

// H2: Major sections - clear hierarchy
globalStyle(`${articleVariant} .rich-heading-h2`, {
  fontSize: '1.5em',
  fontWeight: 700,
  lineHeight: '1.3333333',
  marginTop: '2em',
  marginBottom: '1em',
  letterSpacing: '-0.025em',
  color: vars.color.text,
})

globalStyle(`${articleVariant} .rich-heading-h2 + *`, {
  marginTop: 0,
})

// H3: Subsections
globalStyle(`${articleVariant} .rich-heading-h3`, {
  fontSize: '1.25em',
  fontWeight: 600,
  lineHeight: '1.6',
  marginTop: '1.6em',
  marginBottom: '0.6em',
  letterSpacing: '-0.025em',
  color: vars.color.text,
})

globalStyle(`${articleVariant} .rich-heading-h3 + *`, {
  marginTop: 0,
})

// H4-H6: Minor headings with decreasing prominence
globalStyle(`${articleVariant} .rich-heading-h4`, {
  fontSize: '1.125em',
  fontWeight: 600,
  lineHeight: '1.5',
  marginTop: '1.5em',
  marginBottom: '0.5em',
  letterSpacing: '-0.025em',
  color: vars.color.text,
})

globalStyle(`${articleVariant} .rich-heading-h4 + *`, {
  marginTop: 0,
})

globalStyle(`${articleVariant} .rich-heading-h5`, {
  fontSize: '1em',
  fontWeight: 600,
  lineHeight: '1.5',
  marginTop: '1.5em',
  marginBottom: '0.5em',
  letterSpacing: '-0.025em',
  color: vars.color.text,
})

globalStyle(`${articleVariant} .rich-heading-h5 + *`, {
  marginTop: 0,
})

globalStyle(`${articleVariant} .rich-heading-h6`, {
  fontSize: '0.875em',
  fontWeight: 600,
  lineHeight: '1.5',
  marginTop: '1.5em',
  marginBottom: '0.5em',
  letterSpacing: '-0.025em',
  color: vars.color.textSecondary,
  textTransform: 'uppercase',
})

globalStyle(`${articleVariant} .rich-heading-h6 + *`, {
  marginTop: 0,
})

// ─── Inline elements ────────────────────────────────────
globalStyle(`${articleVariant} .rich-link`, {
  fontWeight: 500,
  textDecoration: 'underline',
  textDecorationThickness: '1px',
  textUnderlineOffset: '2px',
  transition: 'color 0.15s ease',
})

globalStyle(`${articleVariant} .rich-link:hover`, {
  textDecorationThickness: '2px',
})

globalStyle(`${articleVariant} .rich-text-bold`, {
  fontWeight: 600,
  color: vars.color.text,
})

globalStyle(`${articleVariant} .rich-text-code`, {
  fontSize: '0.875em',
  fontWeight: 500,
  padding: '0.2em 0.4em',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.codeBg,
})

// ─── Blockquote (prose-style) ───────────────────────────
globalStyle(`${articleVariant} .rich-quote`, {
  fontStyle: 'italic',
  fontSize: '1.125em',
  lineHeight: '1.75',
  color: vars.color.textSecondary,
  borderLeftWidth: '0.25rem',
  borderLeftStyle: 'solid',
  borderLeftColor: vars.color.quoteBorder,
  backgroundColor: 'transparent',
  marginTop: '1.6em',
  marginBottom: '1.6em',
  paddingLeft: '1em',
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  borderRadius: 0,
})

globalStyle(`${articleVariant} .rich-quote p:first-of-type`, {
  marginTop: 0,
})

globalStyle(`${articleVariant} .rich-quote p:last-of-type`, {
  marginBottom: 0,
})

// ─── Lists (prose-style) ────────────────────────────────
globalStyle(
  `${articleVariant} .rich-list-ol, ${articleVariant} .rich-list-ul`,
  {
    marginTop: '1.25em',
    marginBottom: '1.25em',
    paddingLeft: '1.625em',
  },
)

globalStyle(`${articleVariant} .rich-list-ol`, {
  listStyleType: 'decimal',
})

globalStyle(`${articleVariant} .rich-list-ul`, {
  listStyleType: 'disc',
})

globalStyle(`${articleVariant} .rich-list-item`, {
  marginTop: '0.5em',
  marginBottom: '0.5em',
  paddingLeft: '0.375em',
})

globalStyle(`${articleVariant} .rich-list-item::marker`, {
  color: vars.color.textSecondary,
})

globalStyle(`${articleVariant} .rich-list-ol > .rich-list-item::marker`, {
  fontWeight: 400,
  color: vars.color.textSecondary,
})

globalStyle(
  `${articleVariant} .rich-list-item > .rich-list-ol, ${articleVariant} .rich-list-item > .rich-list-ul`,
  {
    marginTop: '0.75em',
    marginBottom: '0.75em',
  },
)

globalStyle(`${articleVariant} .rich-list-nested-item > .rich-list-ol`, {
  listStyleType: 'lower-alpha',
})

globalStyle(`${articleVariant} .rich-list-nested-item > .rich-list-ul`, {
  listStyleType: 'circle',
})

// ─── Code blocks (prose-style) ──────────────────────────
globalStyle(`${articleVariant} .rich-code-block`, {
  fontSize: '0.875em',
  lineHeight: '1.7142857',
  marginTop: '1.7142857em',
  marginBottom: '1.7142857em',
  borderRadius: vars.borderRadius.md,
  overflowX: 'auto',
})

globalStyle(`${articleVariant} .rich-code-block pre`, {
  padding: '0.8571429em 1.1428571em',
  margin: 0,
})

globalStyle(`${articleVariant} .rich-code-block code`, {
  fontSize: 'inherit',
  lineHeight: 'inherit',
})

// ─── Tables (prose-style) ───────────────────────────────
globalStyle(`${articleVariant} .rich-table`, {
  width: '100%',
  tableLayout: 'auto',
  textAlign: 'left',
  marginTop: '2em',
  marginBottom: '2em',
  fontSize: '0.875em',
  lineHeight: '1.7142857',
})

globalStyle(`${articleVariant} .rich-table thead`, {
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: vars.color.border,
})

globalStyle(`${articleVariant} .rich-table tbody tr`, {
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: vars.color.border,
})

globalStyle(`${articleVariant} .rich-table tbody tr:last-child`, {
  borderBottomWidth: 0,
})

globalStyle(`${articleVariant} .rich-table-cell-header`, {
  fontWeight: 600,
  padding: '0.5714286em 0.75em',
  verticalAlign: 'bottom',
  color: vars.color.text,
})

globalStyle(`${articleVariant} .rich-table-cell`, {
  padding: '0.5714286em 0.75em',
  verticalAlign: 'baseline',
})

// ─── Images (prose-style) ───────────────────────────────
globalStyle(`${articleVariant} .rich-image`, {
  marginTop: '2em',
  marginBottom: '2em',
})

globalStyle(`${articleVariant} .rich-image img`, {
  borderRadius: vars.borderRadius.md,
})

globalStyle(`${articleVariant} .rich-image figcaption`, {
  fontSize: '0.875em',
  lineHeight: '1.4285714',
  marginTop: '0.8571429em',
  color: vars.color.textSecondary,
  textAlign: 'center',
})

// ─── Horizontal rule ────────────────────────────────────
globalStyle(`${articleVariant} .rich-hr`, {
  borderColor: vars.color.border,
  borderTopWidth: '1px',
  marginTop: '3em',
  marginBottom: '3em',
})

// ─── Alerts/Callouts (prose-style) ──────────────────────
globalStyle(`${articleVariant} .rich-alert`, {
  padding: '1em 1.5em',
  marginTop: '1.6em',
  marginBottom: '1.6em',
  borderLeftWidth: '0.25rem',
  borderLeftStyle: 'solid',
  borderRadius: `0 ${vars.borderRadius.sm} ${vars.borderRadius.sm} 0`,
  backgroundColor: vars.color.bgSecondary,
})

globalStyle(`${articleVariant} .rich-alert p:first-child`, {
  marginTop: 0,
})

globalStyle(`${articleVariant} .rich-alert p:last-child`, {
  marginBottom: 0,
})

// ─── KaTeX (prose-style) ────────────────────────────────
globalStyle(`${articleVariant} .rich-katex-block`, {
  marginTop: '1.6em',
  marginBottom: '1.6em',
  overflowX: 'auto',
  padding: '1em 0',
})

// ─── Spoiler (prose-style) ──────────────────────────────
globalStyle(`${articleVariant} .rich-spoiler`, {
  borderRadius: vars.borderRadius.sm,
  paddingInline: '0.25em',
})

// ─── Mentions (prose-style) ─────────────────────────────
globalStyle(`${articleVariant} .rich-mention`, {
  fontWeight: 500,
})

// ─── First-child reset ──────────────────────────────────
globalStyle(`${articleVariant} > *:first-child`, {
  marginTop: 0,
})

globalStyle(`${articleVariant} > *:last-child`, {
  marginBottom: 0,
})
