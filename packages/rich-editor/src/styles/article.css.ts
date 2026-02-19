import { globalStyle, style } from '@vanilla-extract/css'

import { richContent } from './shared.css'
import { articleTheme, darkArticleTheme, vars } from './vars.css'

// Helper for em calculation (based on 18px base)
const em = (target: number, context = 18) => `${target / context}em`
const round = (num: number) => num.toFixed(7).replace(/(\.\d+?)0+$/, '$1')

// Prose LG values from Tailwind Typography
// Base font size: 18px

const articleBase = style({
  maxWidth: '65ch',
  fontSize: vars.typography.fontSizeLarge, // 18px
  lineHeight: round(32 / 18), // 1.7777778
  color: vars.color.text,
})

export const articleVariant = style([richContent, articleTheme, articleBase])
export const darkArticleVariant = style([
  richContent,
  darkArticleTheme,
  articleBase,
])

// ─── Tailwind Prose LG Styles ───────────────────────────
// Reference: https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js

globalStyle(`${articleBase} .rich-paragraph`, {
  marginTop: em(24, 18),
  marginBottom: em(24, 18),
})

globalStyle(`${articleBase} .rich-heading-h1`, {
  color: vars.color.text,
  fontWeight: 800,
  fontSize: em(48, 18), // 2.6666667em
  marginTop: '0',
  marginBottom: em(40, 48), // 0.8333333em
  lineHeight: 1,
})

globalStyle(`${articleBase} .rich-heading-h2`, {
  color: vars.color.text,
  fontWeight: 700,
  fontSize: em(30, 18), // 1.6666667em
  marginTop: em(56, 30), // 1.8666667em
  marginBottom: em(32, 30), // 1.0666667em
  lineHeight: round(40 / 30), // 1.3333333
})

globalStyle(`${articleBase} .rich-heading-h3`, {
  color: vars.color.text,
  fontWeight: 600,
  fontSize: em(24, 18), // 1.3333333em
  marginTop: em(40, 24), // 1.6666667em
  marginBottom: em(16, 24), // 0.6666667em
  lineHeight: round(36 / 24), // 1.5
})

globalStyle(`${articleBase} .rich-heading-h4`, {
  color: vars.color.text,
  fontWeight: 600,
  marginTop: em(32, 18), // 1.7777778em
  marginBottom: em(8, 18), // 0.4444444em
  lineHeight: round(28 / 18), // 1.5555556
})

// Heading + * resets
globalStyle(
  `${articleBase} .rich-heading-h2 + *, ${articleBase} .rich-heading-h3 + *, ${articleBase} .rich-heading-h4 + *`,
  {
    marginTop: '0',
  },
)

globalStyle(`${articleBase} .rich-quote`, {
  fontWeight: 500,
  fontStyle: 'italic',
  color: vars.color.text,
  borderLeftWidth: '0.25rem',
  borderLeftStyle: 'solid',
  borderLeftColor: vars.color.quoteBorder,
  marginTop: em(40, 18),
  marginBottom: em(40, 18),
  paddingLeft: em(24, 18),
  backgroundColor: 'transparent',
  borderRadius: 0,
  quotes: '"\\201C""\\201D""\\2018""\\2019"',
})

globalStyle(
  `${articleBase} .rich-quote .rich-paragraph:first-of-type::before`,
  {
    content: 'open-quote',
  },
)

globalStyle(`${articleBase} .rich-quote .rich-paragraph:last-of-type::after`, {
  content: 'close-quote',
})

globalStyle(`${articleBase} .rich-quote .rich-paragraph:first-child`, {
  marginTop: 0,
})

globalStyle(`${articleBase} .rich-quote .rich-paragraph:last-child`, {
  marginBottom: 0,
})

globalStyle(`${articleBase} .rich-text-code`, {
  color: vars.color.text,
  fontWeight: 600,
  fontSize: em(16, 18), // 0.8888889em
  backgroundColor: vars.color.codeBg,
  padding: '0.2em 0.4em',
  borderRadius: vars.borderRadius.sm,
  fontFamily: vars.typography.fontMono,
})

globalStyle(
  `${articleBase} .rich-text-code::before, ${articleBase} .rich-text-code::after`,
  {
    content: '"`"',
    color: vars.color.textSecondary,
    opacity: 0.5,
  },
)

globalStyle(`${articleBase} .rich-code-block`, {
  color: vars.color.text,
  backgroundColor: vars.color.codeBg,
  borderRadius: '0.375rem', // rem(6)
  marginTop: em(32, 16), // 2em (relative to code font size 16px)
  marginBottom: em(32, 16),
  fontSize: em(16, 18), // 0.8888889em
  lineHeight: round(28 / 16), // 1.75
})

globalStyle(`${articleBase} .rich-code-block pre`, {
  paddingTop: em(16, 16), // 1em
  paddingRight: em(24, 16), // 1.5em
  paddingBottom: em(16, 16),
  paddingLeft: em(24, 16),
  margin: 0, // Reset default pre margin
})

globalStyle(`${articleBase} .rich-list-ul, ${articleBase} .rich-list-ol`, {
  marginTop: em(24, 18),
  marginBottom: em(24, 18),
  paddingLeft: em(28, 18), // 1.5555556em
})

globalStyle(`${articleBase} .rich-list-item`, {
  marginTop: em(12, 18),
  marginBottom: em(12, 18),
  paddingLeft: em(8, 18), // LG padding inline start for li
})

globalStyle(`${articleBase} .rich-list-item .rich-paragraph`, {
  marginTop: em(16, 18),
  marginBottom: em(16, 18),
})

globalStyle(`${articleBase} .rich-list-item > .rich-paragraph:first-child`, {
  marginTop: em(24, 18),
})

globalStyle(`${articleBase} .rich-list-item > .rich-paragraph:last-child`, {
  marginBottom: em(24, 18),
})

// Nested lists
globalStyle(
  `${articleBase} .rich-list-ul .rich-list-ul, ${articleBase} .rich-list-ul .rich-list-ol, ${articleBase} .rich-list-ol .rich-list-ul, ${articleBase} .rich-list-ol .rich-list-ol`,
  {
    marginTop: em(16, 18),
    marginBottom: em(16, 18),
  },
)

globalStyle(`${articleBase} .rich-table`, {
  marginTop: em(32, 18),
  marginBottom: em(32, 18),
  fontSize: em(16, 18),
  lineHeight: round(24 / 16),
})

globalStyle(`${articleBase} .rich-table .rich-paragraph`, {
  margin: 0,
  padding: 0,
  lineHeight: 'inherit',
})

globalStyle(`${articleBase} .rich-image`, {
  marginTop: em(32, 18),
  marginBottom: em(32, 18),
})

globalStyle(`${articleBase} .rich-image > *`, {
  marginTop: '0',
  marginBottom: '0',
})

globalStyle(`${articleBase} .rich-image figcaption`, {
  color: vars.color.textSecondary,
  fontSize: em(16, 18),
  lineHeight: round(24 / 16), // 1.5
  marginTop: em(16, 16),
})

globalStyle(`${articleBase} .rich-hr`, {
  borderColor: vars.color.border,
  borderTopWidth: '1px',
  marginTop: em(56, 18),
  marginBottom: em(56, 18),
  width: 60,
  marginLeft: 'auto',
  marginRight: 'auto',
})

globalStyle(`${articleBase} .rich-hr + *`, {
  marginTop: '0',
})

globalStyle(`${articleBase} .rich-link`, {
  fontWeight: 500,
  textDecoration: 'underline',
})

// ─── Banner ─────────────────────────────────────────────
globalStyle(`${articleBase} .rich-banner`, {
  margin: `${em(32, 18)} 0`,
})

// ─── Alert ──────────────────────────────────────────────
globalStyle(`${articleBase} .rich-alert`, {
  margin: `${em(32, 18)} 0`,
  padding: `0 ${em(16, 18)}`,
  backgroundColor: 'transparent',
  borderLeftWidth: '0.25rem',
  borderRadius: 0,
})

// ─── Code Snippet ───────────────────────────────────────
globalStyle(`${articleBase} .rich-code-snippet`, {
  margin: `${em(32, 18)} 0`,
})

// ─── Details ────────────────────────────────────────────
globalStyle(`${articleBase} .rich-details`, {
  margin: `${em(32, 18)} 0`,
})

// ─── First-child reset ──────────────────────────────────
globalStyle(`${articleBase} > *:first-child`, {
  marginTop: 0,
})

globalStyle(`${articleBase} > *:last-child`, {
  marginBottom: 0,
})
