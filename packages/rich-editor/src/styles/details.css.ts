import { globalStyle } from '@vanilla-extract/css'

import { richContent } from './shared.css'
import { vars } from './vars.css'

// ─── Details / Collapse ─────────────────────────────────
globalStyle(`${richContent} .rich-details`, {
  margin: `${vars.spacing.md} 0`,
  border: 'none',
})

globalStyle(`${richContent} .rich-details-summary`, {
  display: 'flex',
  width: '100%',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'space-between',
  listStyle: 'none',
  userSelect: 'none',
  fontWeight: 600,
  padding: `${vars.spacing.sm} 0`,
})

globalStyle(`${richContent} .rich-details-summary::-webkit-details-marker`, {
  display: 'none',
})

globalStyle(`${richContent} .rich-details-summary::marker`, {
  display: 'none',
  content: '""',
})

globalStyle(`${richContent} .rich-details-summary-text`, {
  flex: '1 1 0',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

globalStyle(`${richContent} .rich-details-chevron`, {
  display: 'inline-flex',
  flexShrink: 0,
  color: vars.color.textSecondary,
  transition: 'transform 0.2s ease',
})

globalStyle(`${richContent} .rich-details[open] .rich-details-chevron`, {
  transform: 'rotate(180deg)',
})

globalStyle(`${richContent} .rich-details-content`, {
  padding: `${vars.spacing.sm} 0`,
})

globalStyle(
  `${richContent} .rich-details-content > .rich-paragraph:first-child`,
  {
    marginTop: 0,
  },
)

globalStyle(
  `${richContent} .rich-details-content > .rich-paragraph:last-child`,
  {
    marginBottom: 0,
  },
)
