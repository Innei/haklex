import { noteTheme, vars } from '@haklex/rich-style-token/styles'
import { globalStyle, style } from '@vanilla-extract/css'

import { richContent } from './shared.css'

const noteBase = style({
  maxWidth: vars.layout.maxWidth,
  fontSize: vars.typography.fontSizeBase,
  lineHeight: '1.8',
  color: vars.color.text,
})

export const noteVariant = style([richContent, noteTheme, noteBase])

// ─── Paragraphs (prose-style with text-indent) ──────────
// Use direct-child selectors so text-indent / drop-cap only affect
// top-level paragraphs, not paragraphs nested inside alerts, quotes, tables, etc.
const topParagraph = `${noteBase} > .rich-paragraph`
const editorTopParagraph = `${noteBase} .rich-editor__content > .rich-paragraph`
const rendererTopParagraph = `${noteBase} .rich-content__body > .rich-paragraph`

globalStyle(`${topParagraph}, ${editorTopParagraph}, ${rendererTopParagraph}`, {
  marginTop: '1.25em',
  marginBottom: '1.25em',
  lineHeight: '1.8',
})

globalStyle(
  `${topParagraph}:first-of-type, ${editorTopParagraph}:first-of-type, ${rendererTopParagraph}:first-of-type`,
  {
    marginTop: 0,
    marginBottom: '2rem',
  },
)

// Instead of text-indent (which indents the entire first line including
// inline decorators like mention/katex), apply margin on the first text
// child only. If the paragraph starts with a decorator, no indent is added.
globalStyle(
  `${topParagraph}:not(:first-of-type) > [data-lexical-text]:first-child, ${editorTopParagraph}:not(:first-of-type) > [data-lexical-text]:first-child, ${rendererTopParagraph}:not(:first-of-type) > [data-lexical-text]:first-child`,
  {
    marginInlineStart: '2rem',
  },
)

// Drop cap on first paragraph — renderer only (float disrupts editing)
globalStyle(
  `${topParagraph}:first-of-type::first-letter, ${rendererTopParagraph}:first-of-type::first-letter`,
  {
    float: 'left',
    fontSize: '2.4em',
    marginRight: '0.2em',
    lineHeight: '1',
  },
)

// Editor: subtle first-letter accent without float
globalStyle(`${editorTopParagraph}:first-of-type::first-letter`, {
  fontSize: '1.5em',
  fontWeight: 700,
  color: vars.color.accent,
})

globalStyle(
  `${topParagraph}:last-child, ${editorTopParagraph}:last-child, ${rendererTopParagraph}:last-child`,
  {
    marginBottom: 0,
  },
)

// ─── Bold uses sans-serif ────────────────────────────────
globalStyle(`${noteBase} .rich-text-bold`, {
  fontFamily: vars.typography.fontFamily,
  fontWeight: 600,
  color: vars.color.text,
})

// ─── Headings (article-level hierarchy) ──────────────────
globalStyle(`${noteBase} .rich-heading-h1`, {
  fontSize: '2.25em',
  fontWeight: 800,
  lineHeight: '1.1111111',
  marginTop: 0,
  marginBottom: '0.8888889em',
  letterSpacing: '-0.025em',
  color: vars.color.text,
})

globalStyle(`${noteBase} .rich-heading-h2`, {
  fontSize: '1.5em',
  fontWeight: 700,
  lineHeight: '1.3333333',
  marginTop: '2em',
  marginBottom: '1em',
  letterSpacing: '-0.025em',
  color: vars.color.text,
})

globalStyle(`${noteBase} .rich-heading-h2 + *`, {
  marginTop: 0,
})

globalStyle(`${noteBase} .rich-heading-h3`, {
  fontSize: '1.25em',
  fontWeight: 600,
  lineHeight: '1.6',
  marginTop: '1.6em',
  marginBottom: '0.6em',
  letterSpacing: '-0.025em',
  color: vars.color.text,
})

globalStyle(`${noteBase} .rich-heading-h3 + *`, {
  marginTop: 0,
})

globalStyle(`${noteBase} .rich-heading-h4`, {
  fontSize: '1.125em',
  fontWeight: 600,
  lineHeight: '1.5',
  marginTop: '1.5em',
  marginBottom: '0.5em',
  color: vars.color.text,
})

globalStyle(`${noteBase} .rich-heading-h4 + *`, {
  marginTop: 0,
})

globalStyle(`${noteBase} .rich-heading-h5`, {
  fontSize: '1em',
  fontWeight: 600,
  lineHeight: '1.5',
  marginTop: '1.5em',
  marginBottom: '0.5em',
  color: vars.color.text,
})

globalStyle(`${noteBase} .rich-heading-h5 + *`, {
  marginTop: 0,
})

globalStyle(`${noteBase} .rich-heading-h6`, {
  fontSize: '0.875em',
  fontWeight: 600,
  lineHeight: '1.5',
  marginTop: '1.5em',
  marginBottom: '0.5em',
  color: vars.color.text,
  textTransform: 'uppercase',
})

globalStyle(`${noteBase} .rich-heading-h6 + *`, {
  marginTop: 0,
})

// ─── Blockquote (accent bg, no left border) ──────────────
globalStyle(`${noteBase} .rich-quote`, {
  fontStyle: 'normal',
  lineHeight: '1.8',
  color: 'inherit',
  borderLeft: 'none',
  backgroundColor: `color-mix(in srgb, ${vars.color.accent} 10%, transparent)`,
  marginTop: '1.6em',
  marginBottom: '1.6em',
  marginLeft: '-1rem',
  marginRight: '-1rem',
  paddingTop: '1em',
  paddingBottom: '1em',
  paddingLeft: '2em',
  paddingRight: '2em',
  borderRadius: 0,
})

globalStyle(
  `${noteBase} .rich-quote .rich-paragraph:first-child::first-letter`,
  {
    float: 'none',
    fontSize: 'inherit',
    marginRight: 0,
  },
)

// ─── Inline elements ────────────────────────────────────
globalStyle(`${noteBase} .rich-link`, {
  fontWeight: 500,
  textDecoration: 'underline',
  textDecorationThickness: '1px',
  textUnderlineOffset: '2px',
  transition: 'color 0.15s ease',
})

globalStyle(`${noteBase} .rich-link:hover`, {
  textDecorationThickness: '2px',
})

globalStyle(`${noteBase} .rich-text-code`, {
  fontSize: '0.875em',
  fontFamily: vars.typography.fontMono,
  fontWeight: 500,
  padding: '0.2em 0.4em',
  borderRadius: vars.borderRadius.sm,
  backgroundColor: vars.color.codeBg,
})

// ─── Lists ──────────────────────────────────────────────
globalStyle(`${noteBase} .rich-list-ol, ${noteBase} .rich-list-ul`, {
  marginTop: '1.25em',
  marginBottom: '1.25em',
  paddingLeft: '1.625em',
})

globalStyle(`${noteBase} .rich-list-ol`, {
  listStyleType: 'decimal',
})

globalStyle(`${noteBase} .rich-list-ul`, {
  listStyleType: 'disc',
})

globalStyle(`${noteBase} .rich-list-item`, {
  marginTop: '0.5em',
  marginBottom: '0.5em',
  paddingLeft: '0.375em',
})

globalStyle(`${noteBase} .rich-list-item::marker`, {
  color: vars.color.textSecondary,
})

// ─── Code blocks ────────────────────────────────────────
globalStyle(`${noteBase} .rich-code-block`, {
  fontSize: '0.875em',
  lineHeight: '1.7142857',
  marginTop: '1.7142857em',
  marginBottom: '1.7142857em',
  borderRadius: vars.borderRadius.md,
  overflowX: 'auto',
})

globalStyle(`${noteBase} .rich-code-block pre`, {
  padding: '0.8571429em 1.1428571em',
  margin: 0,
})

// ─── Tables ─────────────────────────────────────────────
globalStyle(`${noteBase} .rich-table`, {
  marginTop: '2em',
  marginBottom: '2em',
  fontSize: '0.875em',
  lineHeight: '1.7142857',
})

globalStyle(`${noteBase} .rich-table .rich-paragraph`, {
  margin: 0,
  padding: 0,
  lineHeight: 'inherit',
})

globalStyle(
  `${noteBase} .rich-table .rich-paragraph:first-child::first-letter`,
  {
    float: 'none',
    fontSize: 'inherit',
    marginRight: 0,
  },
)

// ─── Images ─────────────────────────────────────────────
globalStyle(`${noteBase} .rich-image`, {
  marginTop: '2em',
  marginBottom: '2em',
})

globalStyle(`${noteBase} .rich-image img`, {
  borderRadius: vars.borderRadius.md,
})

globalStyle(`${noteBase} .rich-image figcaption`, {
  fontSize: '0.875em',
  lineHeight: '1.4285714',
  marginTop: '0.8571429em',
  color: vars.color.textSecondary,
  textAlign: 'center',
})

// ─── HR (match markdown--note: border + opacity 20%) ───────
globalStyle(`${noteBase} .rich-hr`, {
  border: 'none',
  borderTop: `1px solid ${vars.color.hrBorder}`,
  opacity: 0.2,
  marginTop: '0.5rem',
  marginBottom: '0.5rem',
  width: 60,
  marginLeft: 'auto',
  marginRight: 'auto',
})

// ─── KaTeX ──────────────────────────────────────────────
globalStyle(`${noteBase} .rich-katex-block`, {
  marginTop: '1.6em',
  marginBottom: '1.6em',
  overflowX: 'auto',
  padding: '1em 0',
})

// ─── Spoiler ────────────────────────────────────────────
globalStyle(`${noteBase} .rich-spoiler`, {
  borderRadius: vars.borderRadius.sm,
  paddingInline: '0.25em',
})

// ─── First/Last child reset ─────────────────────────────
globalStyle(`${noteBase} > *:first-child`, {
  marginTop: 0,
})

globalStyle(`${noteBase} > *:last-child`, {
  marginBottom: 0,
})
