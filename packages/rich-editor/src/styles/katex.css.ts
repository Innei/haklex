import { vars } from '@haklex/rich-style-token/styles'
import { globalStyle } from '@vanilla-extract/css'

import { richContent } from './shared.css'

// ─── KaTeX Display ──────────────────────────────────────
globalStyle(`${richContent} .rich-katex-inline`, {
  display: 'inline',
  padding: '0 2px',
  verticalAlign: 'middle',
})

globalStyle(`${richContent} .rich-katex-block`, {
  display: 'block',
  textAlign: 'center',
  padding: `${vars.spacing.md} 0`,
  overflowX: 'auto',
  margin: `${vars.spacing.md} 0`,
})

globalStyle(`${richContent} .rich-katex-fallback`, {
  fontFamily: vars.typography.fontMono,
  fontSize: '0.9em',
  color: vars.color.codeText,
  backgroundColor: vars.color.codeBg,
  padding: '2px 6px',
  borderRadius: vars.borderRadius.sm,
})
